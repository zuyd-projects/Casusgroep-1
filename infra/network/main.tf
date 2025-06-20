resource "azurerm_virtual_network" "vnet" {
  name                = "prod-simulatienetwerk"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = ["10.0.0.0/16"]

  tags = {
    environment = "production"
  }
}

resource "azurerm_subnet" "frontend" {
  name                 = "prod-frontend-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "backend" {
  name                 = "prod-backend-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
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
