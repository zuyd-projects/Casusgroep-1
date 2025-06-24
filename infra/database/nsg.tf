resource "azurerm_network_security_group" "database" {
  name                = "${local.name_prefix}database-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name



  security_rule {
    name                       = "AllowMSSQLAccess"
    description                = "Allow MSSQL access"
    priority                   = 1010
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "1433"
    source_address_prefix      = "${local.network_prefix}.3.0/24" # Assuming the backend subnet is
    destination_address_prefix = "*"

  }

  tags = {
    environment = var.environment
  }
}
