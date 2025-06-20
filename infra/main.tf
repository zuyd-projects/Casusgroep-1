terraform {
  backend "remote" {
    organization = "Nummer1"

    workspaces {
      name = "Casusgroep-1"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "2425-B2C6-B2C-3"
}

# resource "azurerm_virtual_network" "vnet" {
#   name                = "backendVNET"
#   address_space       = ["10.0.0.0/16"]
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name
# }

# resource "azurerm_subnet" "subnet" {
#   name                 = "backendSubnet"
#   resource_group_name  = data.azurerm_resource_group.rg.name

#   virtual_network_name = azurerm_virtual_network.vnet.name
#   address_prefixes     = ["10.0.1.0/24"]
# }

# resource "azurerm_network_interface" "nic" {
#   name                = "nic-linux-docker"
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name

#   ip_configuration {
#     name                          = "ipconfig1"
#     subnet_id                     = azurerm_subnet.frontend.id
#     private_ip_address_allocation = "Dynamic"
#     public_ip_address_id          = azurerm_public_ip.public_ip.id
#   }
# }

# resource "azurerm_public_ip" "public_ip" {
#   name                = "pip-linux-docker"
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name
#   allocation_method   = "Static"
# }

# resource "azurerm_linux_virtual_machine" "vm" {
#   name                            = "vm-linux-docker"
#   resource_group_name             = data.azurerm_resource_group.rg.name
#   location                        = data.azurerm_resource_group.rg.location
#   size                            = "Standard_B1s"
#   admin_username                  = var.admin_username
#   admin_password                  = var.admin_password
#   disable_password_authentication = false

#   network_interface_ids = [
#     azurerm_network_interface.nic.id,
#   ]

#   os_disk {
#     name                 = "disk-linux-docker"
#     caching              = "ReadWrite"
#     storage_account_type = "Standard_LRS"
#   }

#   source_image_reference {
#     publisher = "Canonical"
#     offer     = "0001-com-ubuntu-server-jammy"
#     sku       = "22_04-lts-gen2"
#     version   = "latest"
#   }

#   computer_name      = "linuxdocker"
#   provision_vm_agent = true

#   custom_data = base64encode(file("cloud-init.yaml"))

#   tags = {
#     environment = "dev"
#   }
# }
