resource "azurerm_subnet" "database" {
  name                 = "DatabaseSubnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.0.3.0/24"]
}

resource "azurerm_network_interface" "database" {
  name                = "nic-linux-docker"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.database.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = var.public_ip_id
  }
}

resource "azurerm_linux_virtual_machine" "database" {
  name                            = "vm-linux-docker"
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
    azurerm_network_interface.database.id,
  ]

  os_disk {
    name                 = "disk-linux-docker"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  computer_name      = "linuxdocker"
  provision_vm_agent = true

  custom_data = base64encode(templatefile("cloud-init.yaml", {
    private_key = var.private_key
  }))

  tags = {
    environment = "production"
  }
}
