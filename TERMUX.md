# 📱 Deploy MoeStickersBot on Android (Termux)

A complete guide to run MoeStickersBot 24/7 on your Android phone for free using Termux.

---

## Prerequisites

- Android 7.0+ device
- ~500MB free storage
- Stable internet connection
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

---

## Step 1: Install Termux

> **Important:** Download from **F-Droid**, NOT Google Play Store (Play Store version is outdated and broken).

| App | Source |
|---|---|
| **Termux** | https://f-droid.org/en/packages/com.termux/ |
| **Termux:Boot** (auto-start) | https://f-droid.org/en/packages/com.termux.boot/ |
| **Termux:API** (optional) | https://f-droid.org/en/packages/com.termux.api/ |

Install **Termux** first, then **Termux:Boot** for auto-start on reboot.

---

## Step 2: Initial Setup

Open Termux and run:

```bash
# Grant storage access
termux-setup-storage

# Update all packages
pkg update && pkg upgrade -y

# Install required dependencies
pkg install -y git golang imagemagick gifsicle libwebp bsdtar exiv2 python

# Verify installations
go version
convert --version
gifsicle --version
exiv2 --version
```

---

## Step 3: Clone & Build

```bash
# Clone the repository
git clone https://github.com/Shineii86/MoeStickersBot.git
cd MoeStickersBot

# Build the binary
GONOSUMCHECK="*" GONOSUMDB="*" GOFLAGS="-mod=mod" go build -o MoeStickersBot cmd/MoeStickersBot/main.go

# Make executable
chmod +x MoeStickersBot
```

---

## Step 4: Run the Bot

```bash
# Basic run
./MoeStickersBot --bot_token="YOUR_BOT_TOKEN_HERE"

# Run with logging to file
./MoeStickersBot --bot_token="YOUR_BOT_TOKEN_HERE" --log_level=info > bot.log 2>&1 &

# View logs
tail -f bot.log
```

### Available Flags

| Flag | Description | Required |
|---|---|---|
| `--bot_token` | Telegram Bot Token | ✅ Yes |
| `--data_dir` | Working directory for data | No |
| `--log_level` | Log level (debug/info/warn/error) | No (default: debug) |
| `--admin_uid` | Your Telegram user ID for admin | No |
| `--db_addr` | MariaDB address (e.g., `127.0.0.1:3306`) | No |
| `--db_user` | Database username | No |
| `--db_pass` | Database password | No |

---

## Step 5: Keep Running 24/7

### 5a. Acquire Wake Lock

Prevents Termux from being killed when screen is off:

```bash
termux-wake-lock
```

### 5b. Run in Background with nohup

```bash
cd ~/MoeStickersBot
nohup ./MoeStickersBot --bot_token="YOUR_TOKEN" --log_level=info > bot.log 2>&1 &
echo $! > bot.pid
```

### 5c. Auto-Start on Boot (Termux:Boot)

Create the boot script:

```bash
mkdir -p ~/.termux/boot

cat > ~/.termux/boot/start-bot.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
cd ~/MoeStickersBot
./MoeStickersBot --bot_token="YOUR_TOKEN_HERE" --log_level=info > bot.log 2>&1 &
EOF

chmod +x ~/.termux/boot/start-bot.sh
```

### 5d. Android Battery Settings (CRITICAL)

Without this, Android will kill the bot after a few minutes:

1. **Settings → Apps → Termux → Battery** → Select **"Unrestricted"** or **"Don't optimize"**
2. **Settings → Battery → Background usage limits** → Add Termux to **"Never sleeping apps"**
3. **Open Recent Apps** → Find Termux → Tap the **🔒 lock icon** to prevent it from being cleared

> ⚠️ These settings vary by manufacturer (Samsung, Xiaomi, OnePlus, etc.). Search for "[your phone model] disable battery optimization for apps" if you can't find them.

---

## Step 6: Managing the Bot

### Check if Running
```bash
ps aux | grep MoeStickersBot
# or
cat bot.pid && kill -0 $(cat bot.pid) 2>/dev/null && echo "Running" || echo "Stopped"
```

### View Logs
```bash
tail -f bot.log
# or last 50 lines
tail -50 bot.log
```

### Stop the Bot
```bash
pkill MoeStickersBot
# or
kill $(cat bot.pid)
```

### Restart the Bot
```bash
pkill MoeStickersBot
sleep 2
cd ~/MoeStickersBot
nohup ./MoeStickersBot --bot_token="YOUR_TOKEN" --log_level=info > bot.log 2>&1 &
echo $! > bot.pid
```

### Update the Bot
```bash
cd ~/MoeStickersBot
git pull origin master
GONOSUMCHECK="*" GONOSUMDB="*" GOFLAGS="-mod=mod" go build -o MoeStickersBot cmd/MoeStickersBot/main.go
# Restart
pkill MoeStickersBot
sleep 2
nohup ./MoeStickersBot --bot_token="YOUR_TOKEN" --log_level=info > bot.log 2>&1 &
```

---

## Optional: Database Setup

For persistent sticker tracking and history:

```bash
# Install MariaDB
pkg install mariadb

# Start MariaDB
mysqld_safe &

# Secure installation (set root password)
mysql_secure_installation

# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS moestickersbot;"

# Run bot with database
./MoeStickersBot --bot_token="YOUR_TOKEN" \
  --db_addr=127.0.0.1:3306 \
  --db_user=root \
  --db_pass=YOUR_DB_PASSWORD
```

---

## Optional: WebApp Setup (Sticker Manager)

The WebApp gives you a visual drag-and-drop interface to reorder stickers and edit emoji assignments. It requires HTTPS since Telegram WebApps only work over secure connections.

> **Note:** The bot works fully without the WebApp. This is optional — all sticker operations can be done via bot commands.

### Architecture

```
Telegram WebApp (your phone)
    ↓ HTTPS
ngrok tunnel (public URL)
    ↓ localhost:443
nginx (reverse proxy)
    ├── /webapp/edit   → React static files
    ├── /webapp/export → React static files
    └── /webapp/api/*  → MoeStickersBot (localhost:8080)
```

### W1. Install Additional Dependencies

```bash
pkg install nodejs nginx
```

### W2. Start the Bot with WebApp Enabled

The bot must be running and listening for WebApp API requests:

```bash
cd ~/MoeStickersBot
./MoeStickersBot --bot_token="YOUR_TOKEN" --log_level=info
```

Keep this running in one Termux session. Open a **new session** (swipe from left edge → "New Session") for the next steps.

### W3. Build the React WebApp

```bash
cd ~/MoeStickersBot/web/webapp3

# Install Node dependencies
npm install

# Build for production
# Replace YOUR_DOMAIN with your ngrok URL (without https://)
# You'll get this URL in step W5, so you can skip this step first
# and come back after getting the ngrok URL
REACT_APP_HOST=YOUR_DOMAIN.ngrok-free.app npm run build
```

This creates a `build/` folder with the compiled WebApp.

### W4. Configure nginx

Create the nginx config file:

```bash
mkdir -p ~/nginx-conf

cat > ~/nginx-conf/webapp.conf << 'NGINX'
worker_processes 1;
pid /data/data/com.termux/files/usr/var/run/nginx.pid;

events {
    worker_connections 256;
}

http {
    include /data/data/com.termux/files/usr/share/nginx/conf/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    server {
        listen 8443 ssl;
        server_name _;

        # ngrok handles SSL termination, so use self-signed certs as placeholder
        ssl_certificate /data/data/com.termux/files/usr/etc/nginx/ssl/server.crt;
        ssl_certificate_key /data/data/com.termux/files/usr/etc/nginx/ssl/server.key;

        # Serve the built React app
        location /webapp/edit {
            alias /data/data/com.termux/files/home/MoeStickersBot/web/webapp3/build;
            try_files $uri $uri/ /webapp/edit/index.html;
        }

        location /webapp/export {
            alias /data/data/com.termux/files/home/MoeStickersBot/web/webapp3/build;
            try_files $uri $uri/ /webapp/export/index.html;
        }

        location /webapp/static {
            alias /data/data/com.termux/files/home/MoeStickersBot/web/webapp3/build/static;
        }

        # Proxy API requests to the Go bot
        location /webapp/api {
            proxy_pass http://127.0.0.1:8080/api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
NGINX
```

Generate self-signed SSL certificates (required by nginx even though ngrok handles real SSL):

```bash
mkdir -p /data/data/com.termux/files/usr/etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /data/data/com.termux/files/usr/etc/nginx/ssl/server.key \
  -out /data/data/com.termux/files/usr/etc/nginx/ssl/server.crt \
  -subj "/CN=localhost"
```

Test and start nginx:

```bash
nginx -c ~/nginx-conf/webapp.conf -t
nginx -c ~/nginx-conf/webapp.conf
```

### W5. Set Up ngrok for HTTPS

Telegram WebApps require HTTPS. ngrok gives you a free public HTTPS URL that tunnels to your phone.

1. Sign up at **https://ngrok.com** (free plan)
2. Get your auth token from the ngrok dashboard
3. Configure and run:

```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN

# Start tunnel — forward HTTPS to nginx on port 8443
ngrok http 8443
```

ngrok will display something like:

```
Forwarding  https://abcd1234.ngrok-free.app → http://localhost:8443
```

**Copy that `https://xxxx.ngrok-free.app` URL** — this is your WebApp's public address.

### W6. Rebuild WebApp with Your Domain

Now that you have the ngrok URL, rebuild the React app with the correct host:

```bash
cd ~/MoeStickersBot/web/webapp3

# Replace with your actual ngrok URL (without https://)
REACT_APP_HOST=abcd1234.ngrok-free.app npm run build

# Reload nginx to pick up the new build
nginx -s reload -c ~/nginx-conf/webapp.conf
```

### W7. Configure the Bot

Set the WebApp URL in your bot so Telegram knows where to load the WebApp from. Check your bot's configuration for a `--webapp_url` or similar flag, or configure it via @BotFather:

1. Open @BotFather
2. Send `/setmenubutton`
3. Select your bot
4. Enter the WebApp URL: `https://abcd1234.ngrok-free.app/webapp/edit`

### W8. Access the WebApp

Open your bot in Telegram → tap the **menu button** (☰) → select **Manage Stickers**. The WebApp should open inside Telegram.

### Stopping the WebApp

```bash
# Stop ngrok
pkill ngrok

# Stop nginx
nginx -s stop -c ~/nginx-conf/webapp.conf
```

### WebApp Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid WebApp initData" | Make sure you launched the WebApp via `/manage` command or menu button, not by opening the URL directly |
| Blank page | Check if nginx is running: `pgrep nginx`. Check build exists: `ls ~/MoeStickersBot/web/webapp3/build/` |
| API errors | Make sure the bot is running: `pgrep MoeStickersBot` |
| ngrok "tunnel not found" | ngrok free tunnels expire. Restart `ngrok http 8443` and rebuild with the new URL |
| HTTPS error | Telegram requires HTTPS. Make sure you're using the ngrok `https://` URL, not `http://` |
| npm install fails | Run `pkg update && pkg upgrade -y` and try again. If storage error: `go clean -cache && pkg clean` |

### WebApp Resource Usage (Additional)

| Resource | Extra Usage |
|----------|------------|
| **RAM** | +50 MB (nginx + node) |
| **Storage** | +150 MB (node_modules + build) |
| **Data** | Minimal (only when WebApp is open) |

---

## Troubleshooting

### Bot gets killed after screen off
- Enable **Unrestricted battery** for Termux
- Run `termux-wake-lock`
- Lock Termux in recent apps

### `go build` fails with network error
```bash
# Try changing Termux mirror
termux-change-repo
# Select a mirror close to your region
```

### `pkg install` fails
```bash
pkg update --fix-missing
pkg install -y <package_name>
```

### Bot crashes immediately
```bash
# Check error log
cat bot.log
# Run in foreground to see output
./MoeStickersBot --bot_token="YOUR_TOKEN"
```

### Permission denied
```bash
chmod +x MoeStickersBot
```

### Out of storage
```bash
# Check storage
df -h
# Clean Go build cache
go clean -cache
# Clean Termux packages
pkg clean
```

---

## Resource Usage

| Resource | Usage |
|---|---|
| **RAM** | ~50-100 MB |
| **Storage** | ~200 MB (binary + dependencies) |
| **CPU** | Minimal (spikes during sticker processing) |
| **Battery** | Very low (~1-2% per hour) |
| **Data** | Depends on usage (~10-50 MB/day) |

---

## Quick Reference

```bash
# One-liner: install everything and run
pkg update && pkg upgrade -y && pkg install -y git golang imagemagick gifsicle libwebp bsdtar exiv2 && git clone https://github.com/Shineii86/MoeStickersBot.git && cd MoeStickersBot && GONOSUMCHECK="*" GONOSUMDB="*" GOFLAGS="-mod=mod" go build -o MoeStickersBot cmd/MoeStickersBot/main.go && chmod +x MoeStickersBot && termux-wake-lock && nohup ./MoeStickersBot --bot_token="YOUR_TOKEN" > bot.log 2>&1 &
```

---

**Cost: ₹0 / $0** — Runs entirely on your phone. No server, no VPS, no subscription.
