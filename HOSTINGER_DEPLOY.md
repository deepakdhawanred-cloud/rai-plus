# Deploying Rai Plus to Hostinger

Rai Plus is a full-stack React + Express application (`vite build` + `node server.ts`) ready for **Hostinger Node.js Web Apps** (Business / Cloud Hosting via hPanel) or a **Hostinger VPS**.

---

## Option 1: Hostinger hPanel — Node.js Web App (Recommended / Easiest)

1. **Export / Push Code to GitHub**
   - Push this repository to a GitHub repository (private or public).
2. **Create a Node.js App in Hostinger hPanel**
   - Go to **hPanel → Websites → Add Website → Node.js Web App** (or **Deploy from GitHub**).
   - Connect your GitHub repository and select your domain.
3. **Configure Build & Runtime Settings**
   - **Node.js Version:** `22` (22.18+ required to run `node server.ts` directly)
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Entry Point (if asked):** `server.ts`
4. **Add Environment Variables in hPanel**
   - `NODE_ENV` = `production`
   - `SUPABASE_PROJECT_ID` = `nsnzsjcqrpkleqifeffz`
   - `SUPABASE_SECRET_KEY` = *(your Supabase Secret / `service_role` key from Supabase → Project Settings → API Keys)*
   - `GEMINI_API_KEY` = *(your Gemini API key, if using AI-generated career/curriculum drafts)*
   - `VITE_GOOGLE_MAPS_API_KEY` = *(optional, for live GPS bus map)*
   - `APP_URL` = `https://yourdomain.com`
   - *(Note: Hostinger automatically injects `PORT`; `server.ts` binds `process.env.PORT || 3000` automatically.)*
5. **Run Supabase Schema Once**
   - In your Supabase Dashboard → **SQL Editor**, paste and execute `supabase/schema.sql`.
6. **Deploy & Verify**
   - Trigger deployment in hPanel and visit `https://yourdomain.com/api/health` — it should return `{"ok":true,"service":"rai-plus"}`.

---

## Option 2: Hostinger VPS (Ubuntu 22.04/24.04 + PM2 + Nginx + SSL)

```bash
# 1. Install Node.js 22 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clone & build Rai Plus
git clone <your-repo-url> /var/www/rai-plus
cd /var/www/rai-plus
npm install
npm run build

# 3. Create production .env (never commit this file)
cat << 'EOF' > .env
NODE_ENV=production
PORT=3000
APP_URL=https://yourdomain.com
SUPABASE_PROJECT_ID=nsnzsjcqrpkleqifeffz
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
EOF
chmod 600 .env

# 4. Start with PM2 and enable auto-restart on reboot
pm2 start "npm start" --name rai-plus
pm2 save
pm2 startup
```

### Nginx Reverse Proxy (`/etc/nginx/sites-available/rai-plus`)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site and issue a free SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/rai-plus /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
