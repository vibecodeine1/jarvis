import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { WORKSPACE } from "./topics.config.ts";

const STORE_PATH = join(WORKSPACE, ".sessions", "sessions.json");

type Store = Record<string, string>; // topicKey -> claude session_id

function load(): Store {
  if (!existsSync(STORE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function save(store: Store): void {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function getSessionId(topicKey: string): string | undefined {
  return load()[topicKey];
}

export function setSessionId(topicKey: string, sessionId: string): void {
  const store = load();
  store[topicKey] = sessionId;
  save(store);
}

/** Drop a stored session, e.g. after --resume fails because it expired. */
export function clearSessionId(topicKey: string): void {
  const store = load();
  delete store[topicKey];
  save(store);
}
