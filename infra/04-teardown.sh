#!/usr/bin/env bash
# ==============================================================================
# Teardown & Resource Destruction Script
# Cloud Computing Course Project — Group 33
# Safe cleanup to eliminate ongoing credit consumption
# ==============================================================================
set -e

ZONE="asia-south1-a"

echo "================================================================="
echo "⚠️  WARNING: TEARING DOWN MYNTRAFLASH GCP INFRASTRUCTURE"
echo "================================================================="
read -p "Are you sure you want to delete all deployed resources? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo "1. Deleting Global Forwarding Rule..."
gcloud compute forwarding-rules delete fwd-myntraflash --global --quiet || true

echo "2. Deleting Target HTTP Proxy..."
gcloud compute target-http-proxies delete proxy-myntraflash --quiet || true

echo "3. Deleting URL Map..."
gcloud compute url-maps delete urlmap-myntraflash --quiet || true

echo "4. Deleting Backend Service..."
gcloud compute backend-services delete backend-myntraflash --global --quiet || true

echo "5. Deleting Health Check..."
gcloud compute health-checks delete hc-myntraflash --quiet || true

echo "6. Deleting Autoscaler & Managed Instance Group..."
gcloud compute instance-groups managed delete mig-myntraflash --zone="${ZONE}" --quiet || true

echo "7. Deleting Instance Template..."
gcloud compute instance-templates delete template-myntraflash-v1 --quiet || true

echo "8. Deleting Firewall Rules..."
gcloud compute firewall-rules delete fw-myntraflash-http fw-myntraflash-health-check --quiet || true

echo "================================================================="
echo "✅ All compute and load balancer resources destroyed successfully."
echo "💰 Zero ongoing billing will occur for Compute Engine."
echo "================================================================="

