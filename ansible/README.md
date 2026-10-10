# SareeShop — Live Deploy (Ansible / WSL)

Fresh Ubuntu server pe **ek command** se pura project live — including **`saree-app.sql` catalog data** + storage images.

## What it installs

- Node.js 22, PM2
- MySQL 8 + database `saree_app` + app user
- Imports **`SareeShop/saree-app.sql`** (products, categories, brands, variants, users, …)
- Syncs **`Saree-app-storage/api/public/storage`** (product/category images)
- Nginx reverse proxy (`/`, `/api`, `/storage`, `/uploads`, `/socket.io`)
- UFW firewall (22/80/443)
- Syncs `nest-api` + `next-app`
- `npm install` + build both apps
- PM2: `sareeshop-api` (8001), `sareeshop-web` (3000)
- Optional Let's Encrypt SSL

## Required local files before deploy

```
SareeShop/
  saree-app.sql
  Saree-app-storage/api/public/storage/{products,categories}/...
  nest-api/
  next-app/
  ansible/
```

## One-time setup (WSL)

```bash
cd /mnt/d/SapnaEcom/SareeShop/ansible
cp inventory.ini.example inventory.ini
cp group_vars/all.yml.example group_vars/all.yml
nano inventory.ini          # server IP + SSH user
nano group_vars/all.yml     # domain + passwords (never commit this file)
```

**Must change:** `mysql_root_password`, `db_password`, `jwt_secret`, `admin_password`.

**Payments & shipping (in `group_vars/all.yml`):**

| Variable | Purpose |
|----------|---------|
| `payment_gateway` | `razorpay` (online checkout) |
| `razorpay_key_id` | Razorpay Key ID (`rzp_test_...` or live `rzp_live_...`) |
| `razorpay_key_secret` | Razorpay secret (server only — never in Next.js) |
| `delhivery_api_key` | Delhivery API token |
| `delhivery_pickup_location` | Warehouse name in Delhivery dashboard |
| `delhivery_return_*` | Return address for shipments |

Default domain is **`svastrastore.com`**. Point Hostinger DNS A-records first:

| Host | Type | Value |
|------|------|--------|
| `@` | A | `YOUR_SERVER_IP` |
| `www` | A | `YOUR_SERVER_IP` |

Then deploy. After DNS works, enable SSL:

```yaml
frontend_url: "https://svastrastore.com"
enable_ssl: true
```

First deploy without SSL (HTTP):

```yaml
frontend_url: "http://svastrastore.com"
enable_ssl: false
import_sql_dump: true
sync_storage: true
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

## Code-only re-deploy (keep DB)

```bash
./deploy.sh -e import_sql_dump=false -e sync_storage=true
```

## Re-import SQL on server (destructive to DB data)

```bash
./deploy.sh -e import_sql_dump=true
```

## Local SQL import (Windows / WSL)

PowerShell:

```powershell
cd d:\SapnaEcom\SareeShop
powershell -ExecutionPolicy Bypass -File .\scripts\import-sql.ps1
```

WSL:

```bash
cd /mnt/d/SapnaEcom/SareeShop
chmod +x scripts/import-sql.sh
./scripts/import-sql.sh
```

## After deploy

| Item | Value |
|------|--------|
| Site | `http://DOMAIN` |
| Admin | `/dashboard` |
| Login | from SQL dump user (or `admin_*` vars if you recreate) |
| API | `http://DOMAIN/api/...` |
| Images | `/storage/products/...`, `/storage/categories/...` |
| PM2 | `sudo -u sareeshop pm2 status` |

## Notes

- Target OS: **Ubuntu 22.04 / 24.04**
- SQL dump has real catalog data — do not also run empty `db:setup` unless `import_sql_dump: false`
- Point DNS before `enable_ssl: true`
