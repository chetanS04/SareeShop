# SareeShop — Live Deploy (Ansible / WSL)

Fresh Ubuntu server pe **ek command** se pura project live.

## What it installs

- Node.js 22, PM2
- MySQL 8 + `saree_shop` DB + user
- Nginx reverse proxy (`/`, `/api`, `/storage`, `/uploads`, `/socket.io`)
- UFW firewall (22/80/443)
- Syncs `nest-api` + `next-app` from your local PC
- `npm install` + build both apps
- DB migrate + seed (`npm run db:setup`)
- PM2 processes: `sareeshop-api` (8001), `sareeshop-web` (3000)
- Optional Let's Encrypt SSL

## One-time setup (WSL)

```bash
# Open WSL, go to ansible folder
cd /mnt/d/SapnaEcom/SareeShop/ansible

# 1) Inventory (server IP + SSH user)
cp inventory.ini.example inventory.ini
nano inventory.ini
```

Example `inventory.ini`:

```ini
[sareeshop]
1.2.3.4 ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa

[sareeshop:vars]
ansible_python_interpreter=/usr/bin/python3
```

Password SSH (if no key):

```ini
[sareeshop]
1.2.3.4 ansible_user=ubuntu ansible_ssh_pass=YourPass ansible_become_pass=YourPass
```

```bash
# 2) Domain + passwords + secrets
nano group_vars/all.yml
```

**Must change:** `app_domain`, `mysql_root_password`, `db_password`, `jwt_secret`, `admin_password`.

Set:

```yaml
frontend_url: "http://YOUR_DOMAIN_OR_IP"   # first deploy without SSL
enable_ssl: false
```

After DNS works:

```yaml
frontend_url: "https://yourdomain.com"
enable_ssl: true
```

## Single command deploy

```bash
cd /mnt/d/SapnaEcom/SareeShop/ansible
chmod +x deploy.sh
./deploy.sh
```

Password SSH:

```bash
./deploy.sh --ask-pass --ask-become-pass
```

Enable SSL on re-run:

```bash
./deploy.sh -e enable_ssl=true -e frontend_url=https://yourdomain.com
```

## After deploy

| Item | Value |
|------|--------|
| Site | `http://DOMAIN` or server IP |
| Admin | `/dashboard` |
| Login | `admin_email` / `admin_password` from `group_vars/all.yml` |
| API | `http://DOMAIN/api/...` |
| PM2 | `sudo -u sareeshop pm2 status` |

## Re-deploy (code update only)

Same command again — rsync + rebuild + PM2 reload.

Skip DB seed on later deploys:

```bash
./deploy.sh -e run_db_setup=false
```

## Notes

- Target OS: **Ubuntu 22.04 / 24.04** (fresh VPS)
- Server needs outbound internet (apt, NodeSource, npm)
- Point DNS A-record to server before `enable_ssl: true`
- Local Windows path in WSL: `/mnt/d/SapnaEcom/SareeShop`
