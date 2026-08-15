# Deployment Guide — AWS Lightsail (ap-south-1)

## Architecture

```
Internet → Nginx (443) → PM2 → Next.js (port 3000) → PostgreSQL (Lightsail DB)
```

## Prerequisites

- Lightsail instance (Ubuntu 22.04+) in **Mumbai (ap-south-1)**
- Lightsail managed PostgreSQL or self-hosted Postgres
- Domain with DNS A record → instance IP
- SSL via Let's Encrypt (`certbot`)

## Environment variables (production)

Set in `/var/www/jk-manpower-erp/.env` (never commit):

| Variable                  | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string with SSL           |
| `NEXTAUTH_URL`            | `https://your-domain.com`                       |
| `NEXTAUTH_SECRET`         | Strong random secret (32+ bytes)                |
| `AUTH_SECRET`             | Same as NEXTAUTH_SECRET or separate             |
| `UPLOADTHING_SECRET`      | UploadThing production secret                   |
| `UPLOADTHING_APP_ID`      | UploadThing app ID                              |
| `SMTP_HOST` / `SMTP_PORT` | Production mail relay                           |
| `BACKUP_COMMAND`          | Optional `pg_dump` command for Phase 15 backups |

## Initial deploy (SCP + PowerShell workflow)

### 1. Build locally or on server

```bash
npm ci --legacy-peer-deps
npx prisma generate
npm run build
```

### 2. Copy to Lightsail

```powershell
scp -r . ubuntu@<LIGHTSAIL_IP>:/var/www/jk-manpower-erp
```

Or use `git pull` on the server if the repo is cloned there.

### 3. Database migration

**Always backup first** — trigger Phase 15 backup from Settings → Backup, or:

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
npx prisma migrate deploy
```

Never use `migrate dev` in production.

### 4. Start with PM2

```bash
cd /var/www/jk-manpower-erp
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow printed instructions for reboot persistence
```

### 5. Nginx reverse proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker alternative (local / staging)

```bash
docker compose up -d postgres mailhog
docker compose up --build app
```

Mailhog UI: http://localhost:8025 (password reset emails in dev).

## CI/CD

GitHub Actions runs on every PR: lint, build, test, audit. On merge to `main`, deploy manually or extend the workflow with SSH deploy steps using GitHub Secrets.

## Branch protection (recommended)

- Require PR reviews
- Require CI status checks to pass
- Disallow force-push to `main`

## Rollback

1. `pm2 stop jk-manpower-erp`
2. `git checkout <previous-tag>`
3. `npm ci && npm run build`
4. Restore DB from backup if migration was applied: `psql $DATABASE_URL < backup.sql`
5. `pm2 restart jk-manpower-erp`

## Mobile app (Phase 16)

Point Flutter build at production API:

```bash
flutter build apk --dart-define=API_BASE_URL=https://your-domain.com
```
