# JARVIS — Multi-Agent Telegram Gateway for Claude Code

A 24/7 personal AI assistant: a Telegram group with topic threads acts as
the UI, a small grammY gateway routes each thread to a specialist system
prompt, and Claude Code (running headless via `claude -p`) does the actual
work — with your business context (`CLAUDE.md`) and connected MCP tools
loaded automatically.

## What's actually in this repo vs. what you still need to do

This scaffold gives you a complete, working **gateway + routing + prompts +
automation** layer. It does **not** and cannot ship real API keys, a live
Telegram group, or working connections to services like GoHighLevel or
beehiiv — those require your accounts and, in a few cases, a small custom
MCP server since not every SaaS tool has an official one yet. Section 4
below tells you exactly what to do for each.

## 0. Environment check (already done for this session)

On the sandbox used to draft this project: Node v22.22.2, npm 10.9.7, and
git 2.43.0 were present; `bun`, `pm2`, and `claude` were **not** installed
(expected — those belong on your actual VPS, not in a docs/build sandbox).
`scripts/setup.sh` installs all three on Ubuntu.

## Implementation Checklist

1. **[This step]** Project structure, dependencies, `.env` boilerplate — done, see below.
2. Provision an Ubuntu VPS (or reuse one you have) and run `scripts/setup.sh`.
3. Create the Telegram bot (@BotFather) and the Telegram group with Topics enabled; get thread IDs.
4. Fill in `.env` (copy from `.env.example`).
5. Fill in `CLAUDE.md` with your real business context (replace every `<TODO>`).
6. Connect MCP servers one by one (Section 4) and add their tool names to `.claude/settings.json` and `gateway/claude-runner.ts`'s allow-list.
7. Authenticate Claude Code on the VPS (`claude` once, interactively).
8. `pm2 start ecosystem.config.cjs && pm2 save && pm2 startup` to keep the gateway alive 24/7.
9. Add the cron entry for the 5am Morning Briefing.
10. Send a test message in each topic thread and confirm the right agent replies.
11. Harden: tighten the tool allow-list, add `--bare` where you want faster/cheaper runs, add logging/monitoring.

## 1. System Architecture (as built)

```
Telegram Group (Topics) ──▶ gateway/index.ts (grammY, Bun)
                                 │  reads message_thread_id
                                 ▼
                        gateway/topics.config.ts
                                 │  maps thread → agent
                                 ▼
                        gateway/claude-runner.ts
                                 │  spawns: claude -p "<msg>"
                                 │    --append-system-prompt-file agents/<agent>.md
                                 │    --resume <session_id>   (continuity per topic)
                                 │  runs from JARVIS_WORKSPACE, so CLAUDE.md and
                                 │  the project .mcp.json load automatically
                                 ▼
                             Claude Code
                          (MCP tools + web) ──▶ reply text ──▶ back to the thread
```

Separately, `cron/morning-briefing.ts` runs once a day, calls Claude Code
with its own system prompt (`agents/morning-briefing.md`), and posts the
result directly to the General thread via the Telegram Bot API (it doesn't
go through the gateway process).

## 2. Multi-Agent Routing

Each topic thread maps to one system-prompt file in `agents/`:

| Topic | File |
|---|---|
| General | `agents/general.md` |
| YouTube | `agents/youtube.md` |
| LinkedIn | `agents/linkedin.md` |
| Newsletter | `agents/newsletter.md` |
| Accountant / Finance | `agents/finance.md` |
| Strategy & Ops | `agents/strategy.md` |
| Chris (Finance & Accounting) | `agents/chris-finance.md` |
| Arturo (Operations) | `agents/arturo-ops.md` |
| Teaching & Training | `agents/teaching.md` |

Thread IDs are read from `.env` (`TOPIC_ID_*`). To find a thread's ID: open
the topic in Telegram, tap "..." → copy link — the trailing number in
`t.me/c/<chat>/<thread_id>` is it. Or run the gateway once, post in each
topic, and read the `Unmapped message_thread_id=...` log lines it prints.

Each topic keeps its own conversation continuity: the gateway stores the
Claude Code `session_id` returned per topic in `.sessions/sessions.json`
and passes `--resume <id>` on the next message in that thread, so context
carries forward within a topic but stays isolated between topics.

## 3. Context & Knowledge Base

`CLAUDE.md` in the project root is the shared business context every agent
reads automatically (Claude Code loads it because the gateway runs `claude`
from `JARVIS_WORKSPACE`, not in `--bare` mode). Fill in every `<TODO>`.

For anything that grows large or changes often (full client list, detailed
project trackers), keep it in Notion/Airtable instead of this file and let
the relevant MCP tool pull it live — that avoids the context going stale
and bloating every single request.

**Supabase (optional):** if you want structured, queryable history (e.g.
"what did we discuss about Client X last month"), the cleanest approach is
a small custom MCP server that reads/writes a Supabase table and exposes
`log_interaction` / `search_interactions` tools — this isn't something
Claude Code ships out of the box, so it's a build step, not a config step.
Happy to scaffold that MCP server next if you want it.

## 4. Integration Layer (MCP Servers)

Connect servers with `claude mcp add` from the VPS, run from inside the
project directory so they save to the shared, git-committable
`.mcp.json` (use `--scope project`):

```bash
# Example pattern — replace URL/command per server's own docs
claude mcp add --scope project --transport http <name> <server-url>
# or, for a local/stdio server:
claude mcp add --scope project <name> -- <command> <args...>
```

Status by service (accurate as of this build, verify current state before relying on it):

- **Google Calendar / Gmail** — official-quality MCP servers exist in the
  community/Anthropic directory; connect via OAuth (`claude mcp add
  --transport http gmail <url>`, then `/mcp` → Authenticate).
- **Notion** — has a hosted MCP server; same OAuth flow.
- **Trello, Airtable** — check the MCP directory (`claude mcp add` lets you
  browse via `/mcp` inside a session, or search the Anthropic directory);
  several community servers exist for both.
- **GoHighLevel, beehiiv, Xero, Apify, n8n** — these are less standardized;
  you may find a community MCP server, or you may need to wrap their REST
  API yourself. A minimal custom MCP server is ~50-100 lines with the
  official MCP SDK (stdio transport, a couple of `tool()` calls hitting
  their API with your API key from `.env`). I can build these with you one
  at a time once the gateway itself is live — start with Stripe and
  Calendar since those feed the morning briefing.
- **Stripe** — Stripe publishes an official remote MCP server; check their
  docs for the current URL.

Whatever you connect, add the exact tool names it exposes (visible via
`/mcp` → select the server, or `claude mcp list`) to:
- `.claude/settings.json` → `permissions.allow` (so headless runs don't
  hang waiting for a permission prompt that never comes)
- `gateway/claude-runner.ts` → `DEFAULT_ALLOWED_TOOLS` (or a per-topic
  override, if e.g. only Finance should see Stripe tools)

**Security note:** the gateway runs with `--permission-mode dontAsk` and an
explicit allow-list, on purpose — anything not explicitly allowed (sending
email, creating calendar events, charging a card, posting publicly) is
denied by default rather than silently approved. `CLAUDE.md`'s global
rules also tell every agent to draft, not send. Loosen this deliberately,
tool by tool, once you trust a given action running unattended.

## 5. Morning Intelligence Automation

`cron/morning-briefing.ts` + `agents/morning-briefing.md` generate and send
the daily brief. Wire it up with cron (not PM2 — it's a one-shot job, not
a long-running process):

```bash
crontab -e
# Ubuntu VPS, adjust paths and TZ to match .env:
0 5 * * * cd /home/deploy/jarvis-assistant && /home/deploy/.bun/bin/bun run cron/morning-briefing.ts >> /var/log/jarvis-morning.log 2>&1
```

It currently aggregates whatever tools are connected and allow-listed; the
prompt (`agents/morning-briefing.md`) explicitly refuses to fabricate a
number it can't fetch, so connect Calendar, Stripe, GHL, and beehiiv before
expecting all four sections to populate.

## Running locally / on the VPS

```bash
bun install                 # or: npm install
cp .env.example .env        # then fill it in
claude                      # one-time: authenticate Claude Code
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

To run without Bun (plain Node + tsx), use the `*:node` package.json
scripts instead (`npm run gateway:node`), and change `interpreter: "bun"`
to `"node"` plus `script: "gateway/index.ts"` → point PM2 at a `tsx`-based
start command in `ecosystem.config.cjs`.

## Next steps I'd recommend, in order

1. Get the gateway running with just the **General** agent and no MCP
   servers connected — confirm Telegram round-trips work end to end.
2. Connect Calendar + Gmail, since almost every other agent benefits from
   scheduling/inbox awareness.
3. Connect Stripe, then get the Morning Briefing sending real revenue data.
4. Build/connect the remaining services one at a time (Section 4), testing
   each in its own topic thread before moving on.
