variable "private_key" {
  type      = string
  sensitive = true
}

variable "admin_ssh_public_key" {
  description = "The SSH public key to access the VM"
  type        = string
  sensitive   = true
}
