#!/bin/bash

# Claudeswitz Google Cloud Platform Deployment Script
echo "🚀 Deploying Claudeswitz to Google Cloud Platform..."

# Set project
export CLOUDSDK_CORE_PROJECT=project-claudeswitz

# Check authentication
echo "📋 Checking Google Cloud authentication..."
if ! /opt/homebrew/share/google-cloud-sdk/bin/gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ No active Google Cloud authentication found"
    echo "🔑 Please run: /opt/homebrew/share/google-cloud-sdk/bin/gcloud auth login"
    echo "🎯 Then run this script again"
    exit 1
fi

echo "✅ Authentication confirmed"

# Build and push Docker image
echo "🐳 Building and pushing Docker image..."

# Build the Docker image
echo "📦 Building Claudeswitz Docker image..."
docker build -t claudeswitz .

# Tag for Google Cloud Artifact Registry
echo "🏷️ Tagging for Google Cloud..."
docker tag claudeswitz us-central1-docker.pkg.dev/project-claudeswitz/claudeswitz/app:latest

# Push to Artifact Registry
echo "📤 Pushing to Google Cloud Artifact Registry..."
docker push us-central1-docker.pkg.dev/project-claudeswitz/claudeswitz/app:latest

# Deploy to Cloud Run
echo "☁️ Deploying to Google Cloud Run..."
/opt/homebrew/share/google-cloud-sdk/bin/gcloud run deploy claudeswitz \
    --image=us-central1-docker.pkg.dev/project-claudeswitz/claudeswitz/app:latest \
    --platform=managed \
    --region=us-central1 \
    --project=project-claudeswitz \
    --allow-unauthenticated \
    --port=3000 \
    --memory=2Gi \
    --cpu=2 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="NEXT_PUBLIC_ANTHROPIC_API_KEY=${NEXT_PUBLIC_ANTHROPIC_API_KEY},NEXT_PUBLIC_GOOGLE_API_KEY=${NEXT_PUBLIC_GOOGLE_API_KEY}"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your Claudeswitz platform should be available at the provided Cloud Run URL"
echo "📊 Features: Decision Analysis, Causal Analysis, Scenario Planning, Strategy Mode"
echo "🧠 Advanced: Get Weird, Expert Mode, Drill-Down, Team Collaboration"
echo "📋 Demo: Complete internal presentation materials included"
echo ""
echo "Repository: https://github.com/wc-ctrl/anthropic-decision-analyzer"
echo "Local: http://localhost:3002"