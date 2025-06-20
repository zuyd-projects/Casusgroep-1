provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "2425-B2C6-B2C-3"
}

terraform {
  backend "remote" {
    organization = "Nummer1"
    workspaces {
      name = "Casusgroep-1"
    }
  }
}
