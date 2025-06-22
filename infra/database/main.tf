resource "azurerm_subnet" "database" {
  name                 = "prod-database-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.0.3.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database.id
}

resource "azurerm_network_interface" "database" {
  name                = "prod-database-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.database.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "10.0.3.10"
  }
}

resource "azurerm_linux_virtual_machine" "database" {
  name                            = "prod-database-vm"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = "Standard_B1s"
  admin_username                  = "azureuser"
  admin_password                  = var.admin_password
  disable_password_authentication = false

  network_interface_ids = [
    azurerm_network_interface.database.id,
  ]

  os_disk {
    name                 = "prod-database-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  computer_name      = "database-vm"
  provision_vm_agent = true

  custom_data = var.cloud_init

  tags = {
    environment = "production"
  }
}
