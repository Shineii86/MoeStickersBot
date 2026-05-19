#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  MariaDB Setup Script for MoeStickersBot
#  Run this on your server BEFORE launching the bot.
# ═══════════════════════════════════════════════════════════════

set -e

# ──── Configuration (EDIT THESE) ────
DB_ROOT_PASS=""                    # Leave empty to skip root password setup
DB_NAME="MoeStickersBot_db"        # Database name
DB_USER="moe_bot"                  # Bot database user
DB_PASS=""                         # Bot database password (REQUIRED)
DB_HOST="127.0.0.1"                # Database host
DB_PORT="3306"                     # Database port

# ──── Colors ────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}ℹ ${NC}$1"; }
success() { echo -e "${GREEN}✔ ${NC}$1"; }
warn()    { echo -e "${YELLOW}⚠ ${NC}$1"; }
error()   { echo -e "${RED}✖ ${NC}$1"; exit 1; }

# ──── Validate ────
if [ -z "$DB_PASS" ]; then
    error "DB_PASS is empty! Set a password in this script before running."
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}  MariaDB Setup for MoeStickersBot${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""

# ──── Step 1: Install MariaDB ────
info "Installing MariaDB server..."
if command -v mariadb &> /dev/null; then
    success "MariaDB already installed"
else
    apt-get update -qq
    apt-get install -y -qq mariadb-server mariadb-client
    success "MariaDB installed"
fi

# ──── Step 2: Start MariaDB ────
info "Starting MariaDB service..."
if systemctl is-active --quiet mariadb 2>/dev/null; then
    success "MariaDB already running"
else
    systemctl start mariadb
    systemctl enable mariadb
    success "MariaDB started and enabled"
fi

# ──── Step 3: Secure Installation ────
if [ -n "$DB_ROOT_PASS" ]; then
    info "Setting root password..."
    mysql -u root <<-EOF
		SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${DB_ROOT_PASS}');
		DELETE FROM mysql.global_priv WHERE User='';
		DELETE FROM mysql.global_priv WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
		DROP DATABASE IF EXISTS test;
		DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
		FLUSH PRIVILEGES;
	EOF
    success "Root password set and installation secured"
else
    warn "Skipping root password setup (DB_ROOT_PASS is empty)"
fi

# ──── Step 4: Create Database and User ────
info "Creating database '${DB_NAME}' and user '${DB_USER}'..."

mysql -u root ${DB_ROOT_PASS:+-p"$DB_ROOT_PASS"} <<-EOF
	-- Create database with utf8mb4 charset
	CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

	-- Create bot user
	CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
	CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
	CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';

	-- Grant permissions
	GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
	GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
	GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';

	FLUSH PRIVILEGES;
EOF

success "Database and user created"

# ──── Step 5: Verify Connection ────
info "Verifying database connection..."
if mysql -u "${DB_USER}" -p"${DB_PASS}" -h "${DB_HOST}" -P "${DB_PORT}" -e "USE \`${DB_NAME}\`;" 2>/dev/null; then
    success "Connection verified!"
else
    error "Failed to connect. Check credentials and try again."
fi

# ──── Done ────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "  Database:  ${CYAN}${DB_NAME}${NC}"
echo -e "  User:      ${CYAN}${DB_USER}${NC}"
echo -e "  Address:   ${CYAN}${DB_HOST}:${DB_PORT}${NC}"
echo ""
echo -e "  Run the bot with:"
echo -e "  ${YELLOW}./MoeStickersBot --bot_token=\"YOUR_TOKEN\" \\${NC}"
echo -e "  ${YELLOW}  --db_addr=${DB_HOST}:${DB_PORT} \\${NC}"
echo -e "  ${YELLOW}  --db_user=${DB_USER} \\${NC}"
echo -e "  ${YELLOW}  --db_pass=\"${DB_PASS}\"${NC}"
echo ""
echo -e "  ${CYAN}The bot will auto-create tables on first run.${NC}"
echo ""
