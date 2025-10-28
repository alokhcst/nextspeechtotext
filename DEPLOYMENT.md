# AWS Deployment Guide

This guide will help you deploy the Next.js Speech to Text application to AWS using Docker, ECS Fargate, and Terraform.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured: `aws configure`
3. **Docker** installed
4. **Terraform** >= 1.0 installed
5. **Anthropic API Key**

## Step 1: Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Output format (e.g., `json`)

## Step 2: Set Up Terraform Variables

1. Copy the example variables file:
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

2. Edit `terraform/terraform.tfvars` and update:
   - `anthropic_api_key` - Your Anthropic API key
   - `domain_name` - Your custom domain (optional)
   - AWS region and other configurations as needed

## Step 3: Build and Push Docker Image to ECR

### For Linux/Mac:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

### For Windows PowerShell:
```powershell
.\build-and-push.ps1
```

This will:
1. Build the Docker image
2. Create ECR repository if it doesn't exist
3. Tag and push the image to ECR

## Step 4: Initialize Terraform

```bash
cd terraform
terraform init
```

## Step 5: Review Terraform Plan

```bash
terraform plan
```

Review the resources that will be created. You should see:
- VPC with public and private subnets
- ECS Cluster
- ECS Task Definition
- Application Load Balancer
- Auto Scaling configuration
- Security Groups
- IAM Roles and Policies

## Step 6: Apply Terraform Configuration

```bash
terraform apply
```

Type `yes` when prompted. This will create all AWS resources.

## Step 7: Access Your Application

After deployment completes, get the ALB DNS name:

```bash
terraform output alb_url
```

Open the URL in your browser. The application will be accessible over HTTPS.

## Step 8: Update Secrets (if needed)

If you need to update your Anthropic API key:

```bash
aws secretsmanager update-secret \
  --secret-id nextspeechtotext-api-key \
  --secret-string "your-new-api-key"
```

Then update the ECS service to pull the new secret:

```bash
aws ecs update-service \
  --cluster nextspeechtotext-cluster \
  --service nextspeechtotext-service \
  --force-new-deployment
```

## Monitoring and Logs

### View CloudWatch Logs

```bash
aws logs tail /ecs/nextspeechtotext --follow
```

### Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster nextspeechtotext-cluster \
  --services nextspeechtotext-service
```

### View Auto Scaling Activity

```bash
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/nextspeechtotext-cluster/nextspeechtotext-service
```

## Updating the Application

To deploy a new version:

1. Make your code changes
2. Rebuild and push the Docker image:
```bash
./build-and-push.sh
```

3. Update the ECS service to use the new image:
```bash
aws ecs update-service \
  --cluster nextspeechtotext-cluster \
  --service nextspeechtotext-service \
  --force-new-deployment
```

## Custom Domain Setup (Optional)

If you have a custom domain:

1. Update `domain_name` in `terraform/terraform.tfvars`
2. Run `terraform apply`
3. Get the ACM certificate ARN:
```bash
terraform output
```
4. Create DNS records pointing to the ALB DNS name
5. Wait for certificate validation

## Scaling

The application automatically scales based on:
- **CPU utilization** (target: 70%)
- **Memory utilization** (target: 80%)

Adjust scaling in `terraform/variables.tf`:
```hcl
min_capacity = 1
max_capacity = 10
```

## Cleanup (Destroy Resources)

To remove all AWS resources:

```bash
cd terraform
terraform destroy
```

⚠️ **Warning**: This will delete all resources including VPC, load balancer, and ECS cluster.

## Troubleshooting

### Task Won't Start

1. Check CloudWatch Logs:
```bash
aws logs tail /ecs/nextspeechtotext --follow
```

2. Check task definition:
```bash
aws ecs describe-task-definition --task-definition nextspeechtotext-task
```

3. Verify secrets are accessible:
```bash
aws secretsmanager get-secret-value --secret-id nextspeechtotext-api-key
```

### Health Check Failing

1. Verify the health check endpoint exists
2. Check security group rules allow traffic from ALB
3. Check CloudWatch logs for application errors

### High Costs

- Reduce `desired_count` in `terraform.tfvars`
- Use smaller instance types (`task_cpu`, `task_memory`)
- Enable auto-scaling to scale down during low usage

## Cost Estimation

Approximate monthly costs (varies by usage):
- ECS Fargate (2 tasks): ~$50/month
- Application Load Balancer: ~$20/month
- NAT Gateway (2): ~$65/month
- Data Transfer: ~$10/month
- **Total**: ~$145/month

## Security Best Practices

✅ All done by Terraform:
- Secrets stored in AWS Secrets Manager
- HTTPS with TLS encryption
- Security groups with least privilege
- Private subnets for ECS tasks
- IAM roles with minimal permissions
- Container Insights enabled for monitoring

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

