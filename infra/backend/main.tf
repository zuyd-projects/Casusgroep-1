resource "azurerm_subnet" "backend" {
  name                 = "${local.name_prefix}backend-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["${local.subnet_prefix}.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "backend" {
  subnet_id                 = azurerm_subnet.backend.id
  network_security_group_id = azurerm_network_security_group.backend.id
}

resource "azurerm_network_interface" "backend" {
  name                = "${local.name_prefix}backend-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.backend.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "${local.subnet_prefix}.10"
  }
  tags = {
    environment = var.environment
  }
}

resource "azurerm_linux_virtual_machine" "backend" {
  name                            = "${local.name_prefix}backend-vm"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = "Standard_B1s"
  admin_username                  = "azureuser"
  admin_password                  = var.admin_password
  disable_password_authentication = false

  network_interface_ids = [
    azurerm_network_interface.backend.id,
  ]

  os_disk {
    name                 = "${local.name_prefix}backend-disk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  computer_name      = "backend-vm${var.environment == "prod" ? "" : "-${var.environment}"}"
  provision_vm_agent = true

  custom_data = var.cloud_init

  tags = {
    environment = var.environment
  }
}
