#!/usr/bin/env bash
# ============================================================
# SareeShop — one-command live deploy from WSL
#
# Usage:
#   1) Edit inventory.ini  (server IP + SSH user)
#   2) Edit group_vars/all.yml  (domain, passwords, secrets)
#   3) From WSL:
#        cd /mnt/d/SapnaEcom/SareeShop/ansible
#        ./deploy.sh
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INV_EXAMPLE="$SCRIPT_DIR/inventory.ini.example"
INV_FILE="$SCRIPT_DIR/inventory.ini"

echo "==> SareeShop Ansible deploy"
echo "    Project: $PROJECT_ROOT"
echo "    Ansible: $SCRIPT_DIR"
echo

# --- inventory ---
if [[ ! -f "$INV_FILE" ]]; then
  cp "$INV_EXAMPLE" "$INV_FILE"
  echo "Created inventory.ini from example."
  echo "Edit it now: set YOUR_SERVER_IP and ansible_user"
  echo "  nano $INV_FILE"
  exit 1
fi

if grep -q "YOUR_SERVER_IP" "$INV_FILE"; then
  echo "ERROR: inventory.ini still has YOUR_SERVER_IP"
  echo "Edit: $INV_FILE"
  exit 1
fi

# --- local ansible install (WSL) ---
need_ansible=0
if ! command -v ansible-playbook >/dev/null 2>&1; then
  need_ansible=1
fi

if [[ "$need_ansible" -eq 1 ]]; then
  echo "==> Installing Ansible on this WSL machine..."
  sudo apt-get update -y
  sudo apt-get install -y ansible python3-pip rsync sshpass
  # Collections for mysql / synchronize / ufw / npm
  ansible-galaxy collection install community.mysql community.general ansible.posix --force
else
  echo "==> Ensuring Ansible collections..."
  ansible-galaxy collection install community.mysql community.general ansible.posix >/dev/null
fi

# --- ssh key hint ---
if ! grep -q "ansible_ssh_private_key_file\|ansible_ssh_pass\|ansible_password" "$INV_FILE"; then
  echo "NOTE: No SSH key/password in inventory.ini."
  echo "      Ensure passwordless SSH works:  ssh <user>@<ip>"
  echo
fi

export ANSIBLE_CONFIG="$SCRIPT_DIR/ansible.cfg"

EXTRA_VARS=(
  "-e" "local_project_root=$PROJECT_ROOT"
)

# Pass through optional flags:
#   ./deploy.sh --ask-pass          (SSH password)
#   ./deploy.sh --ask-become-pass   (sudo password)
#   ./deploy.sh -e enable_ssl=true
#   ./deploy.sh -e allow_example_domain=true   (IP-only first test)
USER_ARGS=("$@")

echo "==> Running playbook site.yml ..."
echo

ansible-playbook "$SCRIPT_DIR/site.yml" \
  -i "$INV_FILE" \
  "${EXTRA_VARS[@]}" \
  "${USER_ARGS[@]}"

echo
echo "==> Done."
echo "    Open your domain (or http://SERVER_IP) after DNS/firewall is ready."
echo "    Admin: see admin_email / admin_password in group_vars/all.yml"
echo "    Logs:  ssh SERVER 'sudo -u sareeshop pm2 logs'"
