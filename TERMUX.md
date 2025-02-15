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
