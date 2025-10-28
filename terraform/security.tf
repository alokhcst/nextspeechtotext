# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# Security Group for ECS
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Allow inbound from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-sg"
  }
}

# Secrets Manager for API Key
resource "aws_secretsmanager_secret" "api_key" {
  name        = "${var.project_name}-anthropic-api-key"
  description = "Anthropic API Key"

  tags = {
    Name = "${var.project_name}-api-key-secret"
  }
}

resource "aws_secretsmanager_secret_version" "api_key" {
  secret_id     = aws_secretsmanager_secret.api_key.id
  secret_string = var.anthropic_api_key
}

# Secrets Manager for Model
resource "aws_secretsmanager_secret" "model" {
  name        = "${var.project_name}-anthropic-model"
  description = "Anthropic Model Name"

  tags = {
    Name = "${var.project_name}-model-secret"
  }
}

resource "aws_secretsmanager_secret_version" "model" {
  secret_id     = aws_secretsmanager_secret.model.id
  secret_string = var.anthropic_model
}

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "app" {
  domain_name       = var.domain_name != "" ? var.domain_name : "*.amazonaws.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-cert"
  }
}


