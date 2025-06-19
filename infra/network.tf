resource "azurerm_virtual_network" "example" {
  name                = "Simulatienetwerk"
  location            = azurerm_resource_group.example.location
    resource_group_name = azurerm_resource_group.example.name
  address_space       = ["10.0.0.0/16"]


  subnet {
    name             = "FrontendSubnet"
    address_prefixes = ["10.0.1.0/24"]
  }

  subnet {
    name             = "BackendSubnet"
    address_prefixes = ["10.0.2.0/24"]

  }

  subnet {
    name             = "DatabaseSubnet"
    address_prefixes = ["10.0.3.0/24"]

  }
    tags = {
    environment = "Production"
  }
}