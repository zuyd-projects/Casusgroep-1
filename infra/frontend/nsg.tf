resource "azurerm_network_security_group" "frontend" {
  name                = "prod-frontend-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name


  security_rule {
    name                       = "AllowHTTPSAccess"
    description                = "Allow HTTPS access"
    priority                   = 1011
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }



  security_rule {
    name                       = "AllowHTTPAccess"
    description                = "Allow HTTP access"
    priority                   = 1010
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  tags = {
    environment = "production"
  }
}
