import "dotenv/config";
import { Bot } from "grammy";
import { resolveTopic, TOPICS } from "./topics.config.ts";
import { runClaudeTurn } from "./claude-runner.ts";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN in .env");

const GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID
  ? Number(process.env.TELEGRAM_GROUP_CHAT_ID)
  : undefined;

const bot = new Bot(token);

// Simple in-memory lock so a burst of messages in one topic doesn't spawn
// overlapping `claude -p` processes against the same session id.
const busyTopics = new Set<string>();

bot.on("message:text", async (ctx) => {
  // Ignore anything outside our configured group, if TELEGRAM_GROUP_CHAT_ID is set.
  if (GROUP_CHAT_ID && ctx.chat.id !== GROUP_CHAT_ID) return;

  const threadId = ctx.message.message_thread_id;
  const topic = resolveTopic(threadId);

  if (!topic) {
    // Message came from the group's default/general area (no topic) or an
    // unmapped thread. Log the thread id so it's easy to wire up in .env.
    console.log(
      `[gateway] Unmapped message_thread_id=${threadId ?? "none"} — ignoring. ` +
        `Add it to .env if this should route to an agent.`
    );
    return;
  }

  if (busyTopics.has(topic.key)) {
    await ctx.reply("Still working on your last message in this thread — one sec.", {
      message_thread_id: threadId,
    });
    return;
  }

  busyTopics.add(topic.key);
  await ctx.replyWithChatAction("typing");

  try {
    const result = await runClaudeTurn(topic, ctx.message.text);
    const reply = result.text.length > 4000
      ? result.text.slice(0, 3990) + "\n\n…(truncated)"
      : result.text;
    await ctx.reply(reply, { message_thread_id: threadId });
  } catch (err) {
    console.error(`[gateway] ${topic.key} agent error:`, err);
    await ctx.reply(
      "Something went wrong running that request. Check the gateway logs on the server.",
      { message_thread_id: threadId }
    );
  } finally {
    busyTopics.delete(topic.key);
  }
});

bot.catch((err) => {
  console.error("[gateway] Unhandled bot error:", err);
});

console.log("[gateway] JARVIS gateway starting. Configured topics:");
for (const t of TOPICS) console.log(`  - ${t.label} (thread ${t.threadId})`);

bot.start({
  onStart: () => console.log("[gateway] Bot is polling for messages."),
});
