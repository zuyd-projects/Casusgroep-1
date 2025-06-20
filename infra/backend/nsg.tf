resource "azurerm_network_security_group" "backend" {
  name                = "prod-backend-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name


  security_rule {
    name                       = "MySQL-Access-Outbound"
    description                = "Allow MySQL access"
    priority                   = 1010
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3306"
    source_address_prefix      = "10.0.2.0/24" # Assuming the backend subnet is
    destination_address_prefix = "10.0.3.0/24" # Assuming the database subnet is

  }

  tags = {
    environment = "production"
  }
}
