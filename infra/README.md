# Google Cloud Platform (GCP) Infrastructure Automation

Automated provisioning scripts for **MyntraFlash** on Google Cloud Platform in region `asia-south1` (Mumbai).

---

## 1. Quick Start via Google Cloud Shell

The easiest, fastest way to deploy without installing Docker or `gcloud` locally:

1. Open [Google Cloud Console](https://console.cloud.google.com).
2. Click the **Activate Cloud Shell** button `[>_]` in the top-right toolbar.
3. Upload or clone this repository in Cloud Shell:
   ```bash
   git clone <YOUR_REPO_URL>
   cd Myntra-cloud_computing-project-
   ```
4. Run the automated scripts in sequence:
   ```bash
   # Make scripts executable
   chmod +x infra/*.sh

   # Step 1: Enable required APIs
   ./infra/01-setup-apis.sh

   # Step 2: Build & push Docker image via Cloud Build
   ./infra/02-build-container.sh

   # Step 3: Provision MIG, Autoscaler & Load Balancer
   ./infra/03-deploy-infrastructure.sh
   ```
5. Note the **Public Load Balancer IP** printed at the conclusion of Step 3:
   ```text
   👉 http://<LOAD_BALANCER_IP>/
   ```

---

## 2. Tear Down When Finished
To ensure you preserve your **$300 free trial credits** and incur zero ongoing charges:
```bash
./infra/04-teardown.sh
```

