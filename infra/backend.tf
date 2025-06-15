# This is the Terraform backend configuration file.
# Not to be confused with the backend for the application itself.
terraform {
  backend "remote" {
    organization = "Nummer1"
    workspaces {
      name = "Casusgroep-1"
    }
  }
}
