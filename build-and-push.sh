#!/bin/bash
# Build and push Docker image to AWS ECR

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY_NAME="nextspeechtotext"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Full ECR repository URI
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"

echo "🏗️  Building Docker image..."
docker build -t ${ECR_REPOSITORY_NAME}:latest .

echo "📦 Tagging image for ECR..."
docker tag ${ECR_REPOSITORY_NAME}:latest ${ECR_REPO_URI}:latest
docker tag ${ECR_REPOSITORY_NAME}:latest ${ECR_REPO_URI}:$(git rev-parse --short HEAD)

echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_URI}

# Check if repository exists, create if not
if ! aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NAME} --region ${AWS_REGION} 2>/dev/null; then
    echo "📝 Creating ECR repository..."
    aws ecr create-repository \
        --repository-name ${ECR_REPOSITORY_NAME} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true
fi

echo "🚀 Pushing image to ECR..."
docker push ${ECR_REPO_URI}:latest
docker push ${ECR_REPO_URI}:$(git rev-parse --short HEAD)

echo "✅ Successfully pushed to ${ECR_REPO_URI}"
echo "Latest image: ${ECR_REPO_URI}:latest"
echo "Git SHA image: ${ECR_REPO_URI}:$(git rev-parse --short HEAD)"

