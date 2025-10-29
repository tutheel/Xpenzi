terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "s3" {
    # Backend values must be provided via `terraform init -backend-config=...`.
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

provider "random" {}

locals {
  project     = "xpenzi"
  environment = var.environment
  tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

output "base_tags" {
  description = "Base tags applied to all resources."
  value       = local.tags
}
