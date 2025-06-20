provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "2425-B2C6-B2C-3"
}
