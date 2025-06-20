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

variable "ghcr_pat" {
  description = "GitHub Release PAT"
  type        = string
  sensitive   = true
}

variable "ghcr_user" {
  description = "GitHub Release username"
  type        = string
}
