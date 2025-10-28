# PowerShell script to build and push Docker image to AWS ECR

$ErrorActionPreference = "Stop"

# Configuration
$AWS_REGION = "us-east-1"
$ECR_REPOSITORY_NAME = "nextspeechtotext"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

# Full ECR repository URI
$ECR_REPO_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"

Write-Host "🏗️  Building Docker image..." -ForegroundColor Cyan
docker build -t ${ECR_REPOSITORY_NAME}:latest .

Write-Host "📦 Tagging image for ECR..." -ForegroundColor Cyan
$GIT_SHA = git rev-parse --short HEAD
docker tag "${ECR_REPOSITORY_NAME}:latest" "${ECR_REPO_URI}:latest"
docker tag "${ECR_REPOSITORY_NAME}:latest" "${ECR_REPO_URI}:${GIT_SHA}"

Write-Host "🔐 Logging in to Amazon ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI

# Check if repository exists, create if not
try {
    aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $AWS_REGION | Out-Null
    Write-Host "Repository exists" -ForegroundColor Green
} catch {
    Write-Host "📝 Creating ECR repository..." -ForegroundColor Cyan
    aws ecr create-repository `
        --repository-name $ECR_REPOSITORY_NAME `
        --region $AWS_REGION `
        --image-scanning-configuration scanOnPush=true
}

Write-Host "🚀 Pushing image to ECR..." -ForegroundColor Cyan
docker push "${ECR_REPO_URI}:latest"
docker push "${ECR_REPO_URI}:${GIT_SHA}"

Write-Host "✅ Successfully pushed to ${ECR_REPO_URI}" -ForegroundColor Green
Write-Host "Latest image: ${ECR_REPO_URI}:latest" -ForegroundColor Green
Write-Host "Git SHA image: ${ECR_REPO_URI}:${GIT_SHA}" -ForegroundColor Green

