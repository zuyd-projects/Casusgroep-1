provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "2425-B2C6-B2C-3"
}

terraform {
  backend "remote" {
    organization = "Nummer1"
    workspaces {
      name = local.workspace_name
    }
  }
}

module "network" {
  source = "./network"

  environment = var.environment

  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
}

module "frontend" {
  source = "./frontend"

  resource_group_name  = data.azurerm_resource_group.rg.name
  location             = data.azurerm_resource_group.rg.location
  vnet_name            = module.network.vnet_name
  public_ip_id         = module.network.public_ip_id
  admin_ssh_public_key = var.admin_ssh_public_key
  environment          = var.environment
  cloud_init = base64encode(templatefile("cloud-init.yaml", {
    private_key = var.private_key
    gh_token    = var.github_token
  }))

  depends_on = [
    module.network,
    module.backend
  ]
}

module "backend" {
  source = "./backend"

  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  vnet_name           = module.network.vnet_name
  public_ip_id        = module.network.public_ip_id
  admin_password      = var.admin_password
  environment         = var.environment
  cloud_init = base64encode(templatefile("cloud-init.yaml", {
    private_key = var.private_key
    gh_token    = var.github_token
  }))

  depends_on = [
    module.network,
    module.database
  ]
}

module "database" {
  source = "./database"

  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  vnet_name           = module.network.vnet_name
  public_ip_id        = module.network.public_ip_id
  admin_password      = var.admin_password
  environment         = var.environment
  cloud_init = base64encode(templatefile("cloud-init.yaml", {
    private_key = var.private_key
    gh_token    = var.github_token
  }))

  depends_on = [
    module.network
  ]
}
