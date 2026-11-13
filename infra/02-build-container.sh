#!/usr/bin/env bash
# ==============================================================================
# Step 2: Container Image Build & Artifact Registry Upload
# Cloud Computing Course Project — Group 33 (Ritul Patel & Divyesh Vagh)
# Uses GCP Cloud Build (No local Docker required)
# ==============================================================================
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
REPO_NAME="myntraflash-repo"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/myntraflash:latest"

echo "================================================================="
echo "📦 Creating Artifact Registry Docker repository: ${REPO_NAME}"
echo "================================================================="

# Create repo if not already existing
if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" &>/dev/null; then
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="MyntraFlash Microservice Docker Images"
  echo "✅ Repository ${REPO_NAME} created."
else
  echo "ℹ️  Repository ${REPO_NAME} already exists."
fi

# Ensure default Compute Engine service account can pull from Artifact Registry
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
GCE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔐 Granting Artifact Registry reader role to GCE service account (${GCE_SA})..."
gcloud artifacts repositories add-iam-policy-binding "${REPO_NAME}" \
  --location="${REGION}" \
  --member="serviceAccount:${GCE_SA}" \
  --role="roles/artifactregistry.reader" || true

echo "🔨 Submitting Docker build to Google Cloud Build (from ./app directory)..."
gcloud builds submit --tag "${IMAGE_TAG}" ./app

echo "================================================================="
echo "✅ Container Image built and published successfully:"
echo "👉 ${IMAGE_TAG}"
echo "================================================================="

