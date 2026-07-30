import "dotenv/config";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { WORKSPACE } from "../gateway/topics.config.ts";

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? "claude";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;
const GENERAL_THREAD_ID = process.env.TOPIC_ID_GENERAL;

if (!BOT_TOKEN || !GROUP_CHAT_ID || !GENERAL_THREAD_ID) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN, TELEGRAM_GROUP_CHAT_ID, and TOPIC_ID_GENERAL must all be set in .env"
  );
}

// Read-only aggregation tools this briefing is allowed to call. Extend this
// list with the exact mcp__<server>__<tool> names once your real MCP
// servers are connected — run `claude mcp list` / `/mcp` to see them.
const ALLOWED_TOOLS = ["Read", "WebFetch"];

function generateBriefing(): Promise<string> {
  return new Promise((resolve, reject) => {
    const systemPromptFile = join(WORKSPACE, "agents/morning-briefing.md");
    const child = spawn(
      CLAUDE_BIN,
      [
        "-p",
        "Generate today's Morning Executive Briefing now.",
        "--append-system-prompt-file",
        systemPromptFile,
        "--model",
        MODEL,
        "--output-format",
        "json",
        "--permission-mode",
        "dontAsk",
        "--allowedTools",
        ALLOWED_TOOLS.join(","),
      ],
      { cwd: WORKSPACE, env: process.env }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !stdout) return reject(new Error(stderr));
      try {
        resolve(JSON.parse(stdout).result ?? stdout);
      } catch {
        resolve(stdout.trim());
      }
    });
  });
}

async function sendToTelegram(text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: GROUP_CHAT_ID,
      message_thread_id: Number(GENERAL_THREAD_ID),
      text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  console.log("[morning-brief] Generating briefing...");
  const briefing = await generateBriefing();
  console.log("[morning-brief] Sending to Telegram General thread...");
  await sendToTelegram(briefing);
  console.log("[morning-brief] Done.");
}

main().catch((err) => {
  console.error("[morning-brief] Failed:", err);
  process.exit(1);
});
