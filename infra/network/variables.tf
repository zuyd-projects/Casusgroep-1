variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "environment" {
  description = "The environment for the deployment (prod or staging)"
  type        = string
}

locals {
  name_prefix   = var.environment == "prod" ? "prod-" : var.environment == "staging" ? "staging-" : "dev-"
  address_space = var.environment == "prod" ? ["10.0.0.0/16"] : var.environment == "staging" ? ["10.1.0.0/16"] : ["10.99.0.0/16"]
}
