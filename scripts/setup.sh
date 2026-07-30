#!/usr/bin/env bash
# JARVIS bootstrap script — run on a fresh Ubuntu VPS as a non-root sudo user.
# Idempotent-ish: safe to re-run, but review before running on a shared box.
set -euo pipefail

echo "== 1/6 System update =="
sudo apt update && sudo apt upgrade -y

echo "== 2/6 Install Node.js 22 (required by Claude Code npm distribution) =="
if ! command -v node >/dev/null || [[ "$(node -v)" < "v22" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi
node -v

echo "== 3/6 Install Bun =="
if ! command -v bun >/dev/null; then
  curl -fsSL https://bun.sh/install | bash
  echo 'export PATH="$HOME/.bun/bin:$PATH"' >> "$HOME/.bashrc"
  export PATH="$HOME/.bun/bin:$PATH"
fi
bun -v

echo "== 4/6 Install PM2 =="
sudo npm install -g pm2

echo "== 5/6 Install Claude Code (native installer) =="
if ! command -v claude >/dev/null; then
  curl -fsSL https://claude.ai/install.sh | bash
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
  export PATH="$HOME/.local/bin:$PATH"
fi
claude --version

echo "== 6/6 Project dependencies =="
cd "$(dirname "$0")/.."
bun install

cat <<'EOF'

Next manual steps:
1. Authenticate Claude Code:      claude
   (log in via browser, or set ANTHROPIC_API_KEY in .env and it will prompt
   you to approve the key)
2. Copy .env.example to .env and fill in every value:
       cp .env.example .env && nano .env
3. Register your MCP servers (see README.md "Integration Layer" section),
   e.g.:
       claude mcp add --scope project --transport http gmail <server-url>
4. Start the gateway with PM2:
       pm2 start ecosystem.config.cjs
       pm2 save
       pm2 startup   # follow the printed instructions to enable on boot
5. Add the cron job for the morning briefing:
       crontab -e
       # then add:
       0 5 * * * cd /path/to/jarvis-assistant && /root/.bun/bin/bun run cron/morning-briefing.ts >> /var/log/jarvis-morning.log 2>&1
EOF
