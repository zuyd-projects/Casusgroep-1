# These variables will be made available from the Terraform Cloud Secrets.
variable "private_key" {
  type      = string
  sensitive = true
}

variable "admin_ssh_public_key" {
  description = "The SSH public key to access the VM"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "The SSH password to access the VM"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub token for accessing private repositories"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment for the deployment (prod or staging)"
  type        = string
}

locals {
  workspace_name = var.environment == "prod" ? "Casusgroep-1" : "Casusgroep-1-staging"
}
