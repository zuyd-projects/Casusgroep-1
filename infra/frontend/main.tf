resource "azurerm_subnet" "frontend" {
  name                 = "prod-frontend-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "frontend" {
  subnet_id                 = azurerm_subnet.frontend.id
  network_security_group_id = azurerm_network_security_group.frontend.id
}

resource "azurerm_network_interface" "frontend" {
  name                = "prod-frontend-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.frontend.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "10.0.1.2"
    public_ip_address_id          = var.public_ip_id
  }
}

resource "azurerm_linux_virtual_machine" "frontend" {
  name                            = "prod-frontend-vm"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = "Standard_B1s"
  admin_username                  = "azureuser"
  disable_password_authentication = true

  admin_ssh_key {
    username   = "azureuser"
    public_key = var.admin_ssh_public_key
  }

  network_interface_ids = [
    azurerm_network_interface.frontend.id,
  ]

  os_disk {
    name                 = "prod-frontend-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  computer_name      = "frontend-vm"
  provision_vm_agent = true

  custom_data = var.cloud_init

  tags = {
    environment    = "production"
    force_recreate = "2025-06-20.1"
  }
}
