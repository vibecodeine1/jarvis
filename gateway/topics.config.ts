import "dotenv/config";

export interface TopicConfig {
  key: string;
  label: string;
  threadId: number;
  /** Path to the agent's system-prompt markdown, relative to JARVIS_WORKSPACE */
  systemPromptFile: string;
}

const workspace = process.env.JARVIS_WORKSPACE ?? process.cwd();

function requireThreadId(envVar: string): number {
  const raw = process.env[envVar];
  if (!raw) {
    throw new Error(
      `Missing ${envVar} in .env — set it to the topic's message_thread_id.`
    );
  }
  const id = Number(raw);
  if (Number.isNaN(id)) {
    throw new Error(`${envVar} must be a number, got "${raw}"`);
  }
  return id;
}

export const WORKSPACE = workspace;

// message_thread_id -> agent config. Populated once from env at startup.
export const TOPICS: TopicConfig[] = [
  {
    key: "general",
    label: "General",
    threadId: requireThreadId("TOPIC_ID_GENERAL"),
    systemPromptFile: "agents/general.md",
  },
  {
    key: "youtube",
    label: "YouTube",
    threadId: requireThreadId("TOPIC_ID_YOUTUBE"),
    systemPromptFile: "agents/youtube.md",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    threadId: requireThreadId("TOPIC_ID_LINKEDIN"),
    systemPromptFile: "agents/linkedin.md",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    threadId: requireThreadId("TOPIC_ID_NEWSLETTER"),
    systemPromptFile: "agents/newsletter.md",
  },
  {
    key: "finance",
    label: "Accountant / Finance",
    threadId: requireThreadId("TOPIC_ID_FINANCE"),
    systemPromptFile: "agents/finance.md",
  },
  {
    key: "strategy",
    label: "Strategy & Ops",
    threadId: requireThreadId("TOPIC_ID_STRATEGY"),
    systemPromptFile: "agents/strategy.md",
  },
];

const byThreadId = new Map(TOPICS.map((t) => [t.threadId, t]));

export function resolveTopic(threadId: number | undefined): TopicConfig | undefined {
  if (threadId === undefined) return undefined;
  return byThreadId.get(threadId);
}
