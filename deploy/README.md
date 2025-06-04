# Deploying Bluflare to DigitalOcean

Want to deploy to DigitalOcean? Use the terraform and ansible files in this directory to deploy Bluflare.

## Prerequisites

- Install [OpenTofu](https://opentofu.org/docs/intro/install/) or [Terraform](https://www.terraform.io/downloads.html)
- Install [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/installation_distros.html)
- Get a DigitalOcean API token with read/write access and save it in the `TF_VAR_DO_TOKEN` environment variable (both terraform and ansible will use this variable)
- Create an SSH key on your local machine in the `~/.ssh/id_ed25519.pub` file (both terraform and ansible will use this file)

## Setup

Make sure the DigitalOcean terraform provider is installed.

```sh
terraform -chdir=terraform init
```

## Provision

Depending if you have OpenTofu or Terraform, replace `tofu` with `terraform` in the commands below. This will provision the necessary cloud resources in DigitalOcean.

```sh
tofu -chdir=terraform apply
```

## Setup host

Using ansible and the following command will setup the host to run the Bluflare.

- To setup the host you need multiple environment variables set. Please refer to the [.env.example](.env.example) file for more information.
- To pull the images you need to have `GHCR_USER` (your GitHub username) and `GHCR_TOKEN` (your GitHub token) set in your environment. Please refer to the [Github Container Registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry) for more information to authenticate.

```sh
ansible-playbook -i ansible/inv.digitalocean.yaml ansible/setup.yaml
```

## Execute Bluflare

Using ansible and the following command will deploy the Bluflare (pull images and run docker compose).

```sh
ansible-playbook -i ansible/inv.digitalocean.yaml ansible/execute.yaml
```

## Teardown

Using terraform and the following command will teardown the cloud resources.

```sh
tofu -chdir=terraform destroy
```
