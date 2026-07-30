# CLAUDE.md — JARVIS Business Context

This file is auto-loaded by Claude Code on every session started in this
workspace. It is the single source of truth every specialist agent reads
before doing any work. Keep it accurate — stale context produces bad output.

> Fill in every `<TODO>` before going live. Treat this like onboarding a new
> hire: assume they know nothing about the business.

## 1. Business Model
- **What we do:** <TODO: one paragraph on the product/service>
- **Revenue model:** <TODO: subscriptions / services / courses / etc.>
- **Target audience (ICP):** <TODO: who exactly are we selling to — role,
  company size, pain points>
- **Tone of voice:** <TODO: e.g. "direct, no fluff, data-backed, occasional
  humor, never salesy">
- **Brand words to avoid:** <TODO>

## 2. Team & Access
- **Owner/operator:** <TODO: name, role>
- **Team members:** <TODO: name — role — areas they own>
- **Who approves what:** <TODO: e.g. "draft only, human sends all client
  emails" or "can auto-send internal Slack/Telegram updates">

## 3. Clients & Active Projects
> Keep this section short here; for anything beyond ~10 lines, move it to
> Notion/Airtable and have the relevant MCP tool pull it live instead of
> duplicating it in this file.
- **Active clients:** <TODO: name — status — next milestone>
- **Project bottlenecks to watch:** <TODO>

## 4. Tech Stack
- Hosting: Ubuntu VPS, PM2/systemd, Node.js + Bun
- Automation: n8n (self-hosted)
- CRM/Sales: GoHighLevel
- Newsletter: beehiiv
- Docs/Wiki: Notion
- PM: Trello / Airtable
- Payments: Stripe
- Accounting: Xero
- Scraping/data: Apify

## 5. Communication Guidelines
- **Channel:** Telegram group with per-topic threads (this system)
- **Response style:** <TODO: bullet points vs prose, emoji usage, max length>
- **Escalation:** <TODO: when should an agent flag something to a human
  instead of just answering>

## 6. Key Performance Metrics
- **North star metric:** <TODO>
- **Weekly targets:** <TODO: e.g. MRR growth %, newsletter subs, LinkedIn
  impressions>
- **Reporting cadence:** Daily 5:00 AM Morning Briefing (see cron/) +
  on-demand via Telegram

## 7. Agent Roster
| Topic | Thread purpose | System prompt file |
|---|---|---|
| General | Admin, cross-domain, catch-all | `agents/general.md` |
| YouTube | Scripts, analytics, content ideas | `agents/youtube.md` |
| LinkedIn | B2B posts, ICP messaging, branding | `agents/linkedin.md` |
| Newsletter | Curation, drafts, email strategy | `agents/newsletter.md` |
| Accountant / Finance | Revenue, invoicing, tracking | `agents/finance.md` |
| Strategy & Ops | Planning, client tracking, bottlenecks | `agents/strategy.md` |

## 8. Global Rules for Every Agent
- Never fabricate numbers (revenue, subscriber counts, analytics). If live
  data isn't available via a connected tool, say so explicitly and ask
  before guessing.
- Never send anything externally (email, DM, post) without explicit
  human confirmation in the same thread, unless the human has set up a
  standing auto-send rule for that action.
- Keep replies scoped to the thread's topic; if a message belongs in a
  different topic, say so and suggest posting it there instead.
- Prefer concise, mobile-readable replies (this is read on a phone).
