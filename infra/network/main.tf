resource "azurerm_virtual_network" "vnet" {
  name                = "${local.name_prefix}simulatienetwerk"
  location            = var.location
  resource_group_name = var.resource_group_name
  address_space       = local.address_space

  tags = {
    environment = var.environment
  }
}

resource "azurerm_public_ip" "public_ip" {
  name                = "${local.name_prefix}public-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"

  tags = {
    environment = var.environment
  }
}

output "vnet_name" {
  value = azurerm_virtual_network.vnet.name
}

output "public_ip_id" {
  value = azurerm_public_ip.public_ip.id
}
