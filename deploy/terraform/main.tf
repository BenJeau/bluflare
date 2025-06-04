resource "digitalocean_ssh_key" "default" {
  name       = "default"
  public_key = file("~/.ssh/id_ed25519.pub")
}

resource "digitalocean_droplet" "bluflare" {
  name     = "bluflare"
  region   = "tor1"
  image    = "ubuntu-24-04-x64"
  size     = "s-1vcpu-512mb"
  ssh_keys = [resource.digitalocean_ssh_key.default.id]
  tags     = ["bluflare"]
}

resource "digitalocean_firewall" "bluflare_fw" {
  name = "only-22-80-443"

  droplet_ids = [digitalocean_droplet.bluflare.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"] # Allow traffic to any destination
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"] # Allow traffic to any destination
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}
