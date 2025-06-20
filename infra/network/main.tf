resource "azurerm_virtual_network" "vnet" {
  name                = "prod-simulatienetwerk"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = ["10.0.0.0/16"]

  tags = {
    environment = "production"
  }
}

resource "azurerm_public_ip" "public_ip" {
  name                = "prod-public-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
}

output "vnet_name" {
  value = azurerm_virtual_network.vnet.name
}

output "public_ip_id" {
  value = azurerm_public_ip.public_ip.id
}
