
resource "azurerm_resource_group" "example" {
  name     = "2425-B2C6-B2C-3"
  location = "West Europe"  # Change to your desired Azure region
}

resource "azurerm_virtual_network" "example" {
  name                = "my-vnet"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "example" {
  name                 = "my-subnet"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "example" {
  name                = "my-public-ip"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  allocation_method   = "Static"  # Change this to "Static" for Standard SKU public IP
  sku                  = "Standard"  # Set SKU to Standard
}


resource "azurerm_network_interface" "example" {
  name                = "my-nic"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  ip_configuration {
    name                          = "my-ip-config"
    subnet_id                     = azurerm_subnet.example.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.example.id
  }
}

resource "azurerm_linux_virtual_machine" "example" {
  name                = "mylinuxvm"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  size                = "Standard_B1s"
  admin_username      = "azureuser"
  admin_password      = "AzureP@ssw0rd!"  # Replace with your desired password
  network_interface_ids = [azurerm_network_interface.example.id]

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Standard_LRS"
    caching              = "ReadOnly"
  }

  disable_password_authentication = false  # Password authentication enabled

  custom_data = base64encode(<<-EOT
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
  EOT
  )
}


