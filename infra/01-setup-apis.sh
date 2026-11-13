#!/usr/bin/env bash
# ==============================================================================
# Step 1: Project Setup & API Initialization
# Cloud Computing Course Project — Group 33 (Divyesh Vagh)
# Region: asia-south1 (Mumbai)
# ==============================================================================
set -e

# Prompt or detect active GCP Project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "❌ Error: No GCP Project configured in gcloud CLI."
  echo "👉 Please set your active project using: gcloud config set project <YOUR_PROJECT_ID>"
  exit 1
fi

echo "================================================================="
echo "🚀 Initializing GCP Project: ${PROJECT_ID}"
echo "📍 Setting default Region: asia-south1 (Mumbai) | Zone: asia-south1-a"
echo "================================================================="

gcloud config set compute/region asia-south1
gcloud config set compute/zone asia-south1-a

echo "⏳ Enabling required Google Cloud APIs (Compute, Artifact Registry, Cloud Build)..."
gcloud services enable \
  compute.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

echo "✅ APIs enabled successfully."

