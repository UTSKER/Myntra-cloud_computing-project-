#!/usr/bin/env bash
# ==============================================================================
# Step 3: Complete GCP Infrastructure Deployment (MIG, Autoscaler, Load Balancer)
# Cloud Computing Course Project — Group 33 (Divyesh Vagh)
# Region: asia-south1 (Mumbai) | Zone: asia-south1-a
# ==============================================================================
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
ZONE="asia-south1-a"
REPO_NAME="myntraflash-repo"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/myntraflash:latest"

echo "================================================================="
echo "🌐 1. Configuring VPC Firewall Rules"
echo "================================================================="

# Allow HTTP on port 80
if ! gcloud compute firewall-rules describe fw-myntraflash-http &>/dev/null; then
  gcloud compute firewall-rules create fw-myntraflash-http \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=myntraflash-node
  echo "✅ Firewall rule fw-myntraflash-http created."
else
  echo "ℹ️  Firewall rule fw-myntraflash-http already exists."
fi

# Allow GCP Cloud Load Balancer & Health Check Probers
if ! gcloud compute firewall-rules describe fw-myntraflash-health-check &>/dev/null; then
  gcloud compute firewall-rules create fw-myntraflash-health-check \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:3000 \
    --source-ranges=35.191.0.0/16,130.211.0.0/22 \
    --target-tags=myntraflash-node
  echo "✅ Firewall rule fw-myntraflash-health-check created."
else
  echo "ℹ️  Firewall rule fw-myntraflash-health-check already exists."
fi

echo "================================================================="
echo "📋 2. Generating Startup Script & GCE Instance Template"
echo "================================================================="

cat << 'EOF' > /tmp/startup-script.sh
#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

# Install Docker Engine
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io

systemctl enable --now docker

# Tune Linux network sockets & file descriptors for extreme concurrency (1M scale)
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sysctl -w net.ipv4.tcp_tw_reuse=1
ulimit -n 65535

# Configure gcloud credentials inside VM for Artifact Registry
gcloud auth configure-docker asia-south1-docker.pkg.dev --quiet || true

# Run container mapping host port 80 to container port 3000
docker pull __IMAGE_TAG__
docker run -d \
  --name myntraflash-app \
  --restart unless-stopped \
  -p 80:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e GCP_REGION="asia-south1 (Mumbai)" \
  __IMAGE_TAG__
EOF

# Substitute actual image tag
sed -i "s|__IMAGE_TAG__|${IMAGE_TAG}|g" /tmp/startup-script.sh

# Delete old template if recreating
if gcloud compute instance-templates describe template-myntraflash-v1 &>/dev/null; then
  echo "ℹ️  Deleting existing instance template..."
  gcloud compute instance-templates delete template-myntraflash-v1 --quiet
fi

# Create Instance Template
gcloud compute instance-templates create template-myntraflash-v1 \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=myntraflash-node,http-server \
  --scopes=cloud-platform \
  --metadata-from-file=startup-script=/tmp/startup-script.sh

echo "✅ Instance Template template-myntraflash-v1 created."

echo "================================================================="
echo "⚙️  3. Creating Managed Instance Group (MIG) & Autoscaler"
echo "================================================================="

# Create Managed Instance Group
if ! gcloud compute instance-groups managed describe mig-myntraflash --zone="${ZONE}" &>/dev/null; then
  gcloud compute instance-groups managed create mig-myntraflash \
    --template=template-myntraflash-v1 \
    --size=1 \
    --zone="${ZONE}"
  echo "✅ MIG mig-myntraflash created."
else
  echo "ℹ️  MIG mig-myntraflash already exists."
fi

# Configure Named Port (http:80)
gcloud compute instance-groups managed set-named-ports mig-myntraflash \
  --named-ports=http:80 \
  --zone="${ZONE}"

# Configure Metric-Based Autoscaler (Target CPU: 60%, Range: 1 to 8 VMs, Fast Cooldown: 60s)
echo "📈 Configuring High-Scale Compute Engine Autoscaler (Target CPU: 60%, Max: 8 VMs)..."
gcloud compute instance-groups managed set-autoscaling mig-myntraflash \
  --zone="${ZONE}" \
  --min-num-replicas=1 \
  --max-num-replicas=8 \
  --target-cpu-utilization=0.60 \
  --cool-down-period=60

echo "✅ Autoscaler active on mig-myntraflash."

echo "================================================================="
echo "🏥 4. Configuring Health Check & Cloud Load Balancer"
echo "================================================================="

# Create HTTP Health Check on /health
if ! gcloud compute health-checks describe hc-myntraflash &>/dev/null; then
  gcloud compute health-checks create http hc-myntraflash \
    --port=80 \
    --request-path=/health \
    --check-interval=15s \
    --timeout=5s \
    --healthy-threshold=2 \
    --unhealthy-threshold=2
  echo "✅ Health check hc-myntraflash created."
else
  echo "ℹ️  Health check hc-myntraflash already exists."
fi

# Create Backend Service
if ! gcloud compute backend-services describe backend-myntraflash --global &>/dev/null; then
  gcloud compute backend-services create backend-myntraflash \
    --protocol=HTTP \
    --port-name=http \
    --health-checks=hc-myntraflash \
    --global
  
  # Add MIG as backend
  gcloud compute backend-services add-backend backend-myntraflash \
    --instance-group=mig-myntraflash \
    --instance-group-zone="${ZONE}" \
    --balancing-mode=UTILIZATION \
    --max-utilization=0.80 \
    --global
  echo "✅ Backend service backend-myntraflash created."
else
  echo "ℹ️  Backend service backend-myntraflash already exists."
fi

# Create URL Map (routes traffic to backend service)
if ! gcloud compute url-maps describe urlmap-myntraflash &>/dev/null; then
  gcloud compute url-maps create urlmap-myntraflash \
    --default-service=backend-myntraflash
  echo "✅ URL map urlmap-myntraflash created."
fi

# Create HTTP Target Proxy
if ! gcloud compute target-http-proxies describe proxy-myntraflash &>/dev/null; then
  gcloud compute target-http-proxies create proxy-myntraflash \
    --url-map=urlmap-myntraflash
  echo "✅ Target HTTP proxy proxy-myntraflash created."
fi

# Create Global Forwarding Rule (Public Port 80)
if ! gcloud compute forwarding-rules describe fwd-myntraflash --global &>/dev/null; then
  gcloud compute forwarding-rules create fwd-myntraflash \
    --ports=80 \
    --target-http-proxy=proxy-myntraflash \
    --global
  echo "✅ Global forwarding rule fwd-myntraflash created."
fi

echo "================================================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================================================="

LB_IP=$(gcloud compute forwarding-rules describe fwd-myntraflash --global --format='value(IPAddress)')

echo ""
echo "🌐 Your MyntraFlash Public Load Balancer Endpoint:"
echo "👉 http://${LB_IP}/"
echo ""
echo "🏥 Health Check Endpoint:"
echo "👉 http://${LB_IP}/health"
echo ""
echo "ℹ️  Note: Newly provisioned Global Load Balancers take ~2-4 minutes to propagate."
echo "================================================================="

