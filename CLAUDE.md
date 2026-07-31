# CLAUDE.md — JARVIS Business Context

This file is auto-loaded by Claude Code on every session started in this
workspace. It is the single source of truth every specialist agent reads
before doing any work. Keep it accurate — stale context produces bad output.

> Fill in every `<TODO>` before going live. Treat this like onboarding a new
> hire: assume they know nothing about the business.

## 1. Business Model
- **What we do:** Skyline Wash Robotics provides autonomous drone-based
  exterior facade, window, and rooftop cleaning services for mid-rise
  commercial and residential buildings (4–20 stories), using the Lucid Bots
  Sherpa platform. A 2-person team (1 FAA Part 107 pilot + 1 ground/water
  support) replaces traditional 6–8 person scaffolding/lift crews, cutting
  job costs 40–80% and job duration from 3–5 days to 1–2 days. Service lines:
  facade/exterior washing, window & glass cleaning, rooftop & solar panel
  cleaning, graffiti/spot treatment, and inspection add-ons.
- **Revenue model:** Per-job pricing (industry reference points: ~$14,000
  average commercial job, $30,000+ on major jobs); alternative per-sq-ft
  pricing ($0.10–$0.45/sq ft) or day-rate for smaller HOA jobs. Strategic
  goal is to convert one-off jobs into quarterly/semi-annual recurring
  maintenance contracts with HOAs and property managers to smooth cash flow
  against the fixed monthly Lucid Refresh subscription cost.
- **Target audience (ICP):** Property management companies and HOA
  management firms are the primary sales channel — one relationship yields
  repeat contracts across a portfolio of buildings. Direct end targets:
  mid-rise multifamily/condo HOAs, Class B/C commercial office and
  mixed-use retail, hotels, self-storage facilities, parking structures,
  and solar/rooftop panel array owners.
- **Tone of voice:** <TODO — not yet specified>. Per the startup plan's own
  marketing guidance: lead with cost and downtime savings (40–80% cost
  reduction, 1–2 days vs. 3–5 days), not the novelty of the drone.
- **Brand words to avoid:** Avoid gadget-hype/novelty framing around the
  drone itself — lead with hard numbers (cost %, days saved, portfolio
  case studies) instead.

## 2. Team & Access
- **Owner/operator:** Jeremiah Khoxayo, founder / sole operator.
- **Team members:** Chris — finance/accounting; Arturo — operations
  (scheduling, crew, equipment). Both have dedicated Telegram topic threads
  (see Section 7). A ground/water support crew member will separately be
  engaged as a 1099 contractor (or part-time W-2 paid per job) once job
  volume starts — not a salaried hire in year one.
- **Who approves what:** Draft only, for everyone. Jeremiah personally
  approves and sends every external communication, content post, contract,
  and spend — including anything Chris or Arturo prepare in their threads.
  No standing auto-send rules exist yet.

## 3. Clients & Active Projects
- **Active clients:** None yet. Currently in **Phase 0: Foundation** (Weeks
  1–6) of the 12-month roadmap — forming the LLC, obtaining the FAA Part 107
  Remote Pilot Certificate, completing Lucid Bots' Sherpa Academy training,
  securing on-demand (pay-per-flight-hour) insurance, and building a simple
  website/portfolio.
- **Project bottlenecks to watch:** Getting the LLC formed and Part 107
  certificate obtained; then moving into **Phase 1: Pre-Sell** (Weeks 4–10)
  — pitching 3–5 property management companies to secure 2–3 signed
  pilot-building contracts with deposits *before* activating the Lucid
  Refresh subscription (equipment cost is deliberately sequenced behind
  signed revenue, not the reverse).

## 4. Tech Stack
- Hosting: Ubuntu VPS, PM2 (this JARVIS system)
- Fleet management: **Lucid Command** (Lucid Bots' fleet software) — logs
  flight data, job history, and maintenance; doubles as a sales asset
  (data-backed before/after reporting for clients)
- CRM/Sales: <TODO — not yet decided>
- Accounting: <TODO — not yet decided>
- Scheduling/PM: <TODO — not yet decided>
- Docs/Wiki: <TODO — not yet decided>
- Marketing/content: <TODO — not yet decided>

## 5. Communication Guidelines
- **Channel:** Telegram group with per-topic threads (this system)
- **Response style:** <TODO: bullet points vs prose, emoji usage, max length>
- **Escalation:** <TODO: when should an agent flag something to a human
  instead of just answering>

## 6. Key Performance Metrics
- **North star metric:** Signed recurring (quarterly/semi-annual)
  maintenance contracts and jobs booked/month. The Phase 4 "scale decision"
  trigger (2nd crew/subscription, or purchase an owned unit via Section 179)
  is 8+ jobs/month sustained.
- **Weekly targets:** <TODO — e.g. number of property management pitches
  made, pilot contracts signed, before/after content pieces published>
- **Reporting cadence:** Daily 5:00 AM Morning Briefing (Central Time, see
  cron/) + on-demand via Telegram

## 7. Agent Roster
| Topic | Thread purpose | System prompt file |
|---|---|---|
| General | Admin, cross-domain, catch-all | `agents/general.md` |
| YouTube | Before/after drone footage, time-lapse content, scripts | `agents/youtube.md` |
| LinkedIn | Outreach to property/HOA managers, case-study posts | `agents/linkedin.md` |
| Newsletter | Curation, drafts, email strategy | `agents/newsletter.md` |
| Accountant / Finance | Job costing, pricing review, revenue tracking | `agents/finance.md` |
| Strategy & Ops | Roadmap milestones, pipeline, capital sequencing | `agents/strategy.md` |
| Chris | Finance & accounting (Chris's dedicated thread) | `agents/chris-finance.md` |
| Arturo | Operations — scheduling, crew, equipment (Arturo's dedicated thread) | `agents/arturo-ops.md` |

## 8. Global Rules for Every Agent
- Never fabricate numbers (revenue, subscriber counts, analytics, job
  pipeline figures). If live data isn't available via a connected tool,
  say so explicitly and ask before guessing.
- Never send anything externally (email, DM, post) without explicit
  human confirmation in the same thread, unless the human has set up a
  standing auto-send rule for that action.
- Keep replies scoped to the thread's topic; if a message belongs in a
  different topic, say so and suggest posting it there instead.
- Prefer concise, mobile-readable replies (this is read on a phone).
- Pricing, insurance, and financing figures referenced from the startup
  plan (Section 9 below) are directional planning estimates as of mid-2026
  — flag them as such, and recommend confirming current numbers with
  Lucid Bots / insurance carriers / a CPA before quoting a client or
  investor.

## 9. Startup Plan Reference
Full plan: `Skyline_Wash_Robotics_Startup_Plan.docx` (founder's local files).
Key figures agents should know without re-reading the full plan:

- **Capital strategy:** Launch on Lucid Bots' subscription model (Lucid
  Refresh, ~$2,950/mo) rather than purchasing a Sherpa outright
  ($35,000–$75,000), rent support equipment, use 1099 labor, operate from a
  home base, and sequence major cash outlay behind signed client deposits.
- **Target launch capital:** ~$8,000–$15,000 lean (subscription model) vs.
  ~$70,000–$120,000+ full buildout (owned fleet).
- **Funding ask (lean path):** $15,000–$20,000 for 90 days of runway — 40%
  subscription bridge, 20% insurance/LLC/Part 107/legal, 15% marketing, 15%
  working capital buffer, 10% misc.
- **12-month roadmap:** Phase 0 Foundation (wk 1–6) → Phase 1 Pre-Sell (wk
  4–10) → Phase 2 Activate (wk 10) → Phase 3 Build Recurring Revenue (mo
  3–6) → Phase 4 Scale Decision (mo 6–12, evaluate 2nd crew/subscription vs.
  owned unit at 8+ jobs/month).
- **Key risks:** weather-dependent scheduling, FAA/NDAA regulatory change
  (confirm Lucid Bots' NDAA-compliance status before bidding on any
  government-adjacent building), single-equipment dependency, client
  skepticism of new tech, underpricing jobs.
