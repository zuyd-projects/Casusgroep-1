resource "azurerm_network_security_group" "database" {
  name                = "prod-database-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name


  security_rule {
    name                       = "AllowSSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "86.82.163.85"
    destination_address_prefix = "*"
  }



  security_rule {
    name                       = "AllowMSSQLAccess"
    description                = "Allow MSSQL access"
    priority                   = 1010
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "1433"
    source_address_prefix      = "10.0.3.0/24" # Assuming the backend subnet is
    destination_address_prefix = "*"

  }

  tags = {
    environment = "production"
  }
}
