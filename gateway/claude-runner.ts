import { spawn } from "node:child_process";
import { join } from "node:path";
import type { TopicConfig } from "./topics.config.ts";
import { WORKSPACE } from "./topics.config.ts";
import { clearSessionId, getSessionId, setSessionId } from "./session-store.ts";

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? "claude";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

// Conservative default allow-list: read/report/draft tools only.
// Anything that sends/pays/deletes externally stays out of this list on
// purpose — see CLAUDE.md "Global Rules for Every Agent". Add scoped
// MCP tool names here (e.g. "mcp__stripe__get_balance") as you connect
// real MCP servers; see README for how to discover exact tool names.
const DEFAULT_ALLOWED_TOOLS = [
  "Read",
  "Grep",
  "Glob",
  "WebFetch",
  "WebSearch",
  // Notion (read-only subset — see README "Integration Layer")
  "mcp__notion__notion-search",
  "mcp__notion__notion-fetch",
  "mcp__notion__notion-download-attachment",
  "mcp__notion__notion-get-comments",
  "mcp__notion__notion-get-async-task",
  "mcp__notion__notion-get-teams",
  "mcp__notion__notion-get-users",
  "mcp__notion__notion-query-data-sources",
  "mcp__notion__notion-query-database-view",
  "mcp__notion__notion-query-meeting-notes",
  "mcp__notion__notion-create-pages",
  // Scoped to this one file — not a blanket Edit grant. See CLAUDE.md
  // "Global Rules for Every Agent" for how agents should treat this.
  "Edit(CLAUDE.md)",
];

export interface RunResult {
  text: string;
  sessionId?: string;
  costUsd?: number;
  isError: boolean;
}

/**
 * Runs a single turn against Claude Code for the given topic, resuming the
 * topic's prior session if one exists. Runs from WORKSPACE so CLAUDE.md and
 * the project .mcp.json load automatically (i.e. NOT --bare mode).
 */
export function runClaudeTurn(
  topic: TopicConfig,
  userPrompt: string
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const systemPromptFile = join(WORKSPACE, topic.systemPromptFile);
    const existingSession = getSessionId(topic.key);

    const args = [
      "-p",
      userPrompt,
      "--append-system-prompt-file",
      systemPromptFile,
      "--model",
      MODEL,
      "--output-format",
      "json",
      "--permission-mode",
      "dontAsk",
      "--allowedTools",
      DEFAULT_ALLOWED_TOOLS.join(","),
    ];

    if (existingSession) {
      args.push("--resume", existingSession);
    }

    const child = spawn(CLAUDE_BIN, args, {
      cwd: WORKSPACE,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code !== 0 && !stdout) {
        // If resuming a stale/expired session caused the failure, drop it
        // and let the next message start fresh instead of failing forever.
        if (existingSession) clearSessionId(topic.key);
        return reject(new Error(stderr || `claude exited with code ${code}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.session_id) setSessionId(topic.key, parsed.session_id);
        resolve({
          text: parsed.result ?? "(no response text)",
          sessionId: parsed.session_id,
          costUsd: parsed.total_cost_usd,
          isError: Boolean(parsed.is_error),
        });
      } catch {
        // Fall back to raw text if JSON parsing ever fails.
        resolve({ text: stdout.trim() || stderr.trim(), isError: code !== 0 });
      }
    });
  });
}
