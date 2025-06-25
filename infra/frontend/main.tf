resource "azurerm_subnet" "frontend" {
  name                 = "${local.name_prefix}frontend-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["${local.subnet_prefix}.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "frontend" {
  subnet_id                 = azurerm_subnet.frontend.id
  network_security_group_id = azurerm_network_security_group.frontend.id
}

resource "azurerm_network_interface" "frontend" {
  name                = "${local.name_prefix}frontend-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.frontend.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "${local.subnet_prefix}.10"
    public_ip_address_id          = var.public_ip_id
  }
  tags = {
    environment = var.environment
  }
}

resource "azurerm_linux_virtual_machine" "frontend" {
  name                            = "${local.name_prefix}frontend-vm"
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
    name                 = "${local.name_prefix}frontend-disk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  computer_name      = "frontend-vm${var.environment == "prod" ? "" : "-${var.environment}"}"
  provision_vm_agent = true

  custom_data = var.cloud_init

  tags = {
    environment = var.environment
  }
}
