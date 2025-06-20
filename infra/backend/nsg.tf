resource "azurerm_network_security_group" "NSG_Backend" {
  name                = "NSGBackend"
  location            = var.location
  resource_group_name = var.resource_group_name

  security_rule {
    name                       = "deny-all-inbound"
    description                = "Deny all inbound traffic"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"

  }


  # NOTE: Inbound rule for MySQL is not needed on the backend NSG, as it is handled by the database NSG.
  # security_rule {
  #   name                       = "MySQL-Accessin"
  #   description                = "Allow MySQL access"
  #   priority                   = 140
  #   direction                  = "Inbound"
  #   access                     = "Allow"
  #   protocol                   = "Tcp"
  #   source_port_range          = "*"
  #   destination_port_range     = "3306"
  #   source_address_prefix      = "10.3.1.10"
  #   destination_address_prefix = "*"

  # }


  security_rule {
    name                       = "MySQL-Access-Outbound"
    description                = "Allow MySQL access"
    priority                   = 140
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3306"
    source_address_prefix      = "10.3.1.10"
    destination_address_prefix = "*"

  }

  tags = {
    environment = "Production"
  }
}
