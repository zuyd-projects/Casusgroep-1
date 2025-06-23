variable "resource_group_name" {
  description = "The name of the resource group where resources will be deployed"
  type        = string
}

variable "location" {
  description = "The Azure region where resources will be deployed"
  type        = string
}

variable "vnet_name" {
  description = "The name of the virtual network where the VM will be deployed"
  type        = string
}

variable "public_ip_id" {
  description = "The ID of the public IP address to associate with the VM"
  type        = string
}

variable "cloud_init" {
  description = "Base64 encoded cloud-init configuration"
  type        = string
  sensitive   = true
}

variable "admin_ssh_public_key" {
  description = "The SSH public key to access the VM"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment for the deployment (prod or staging)"
  type        = string
}

locals {
  name_prefix    = var.environment == "prod" ? "prod-" : var.environment == "staging-" ? "staging" : "dev-"
  network_prefix = var.environment == "prod" ? "10.0" : var.environment == "staging" ? "10.1" : "10.99"
  subnet_prefix  = "${local.network_prefix}.2"
}
