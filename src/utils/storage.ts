import type { ChatSession } from "../types/chat";

const STORAGE_KEY = "frontend-ai-assistant-state";

type StoredState = {
  activeSessionId?: string;
  sessions: ChatSession[];
};

function generateSessionId() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi?.getRandomValues) {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function createSessionTitle(messages: ChatSession["messages"]) {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return "新的会话";
  }

  return firstUserMessage.content.slice(0, 20);
}

export function createEmptySession(): ChatSession {
  const now = Date.now();

  return {
    id: generateSessionId(),
    title: "新的会话",
    messages: [],
    conversationId: undefined,
    createdAt: now,
    updatedAt: now,
    isTitleManuallyEdited: false,
  };
}

export function updateSessionTitle(session: ChatSession): ChatSession {
  if (session.isTitleManuallyEdited) {
    return session;
  }

  return {
    ...session,
    title: createSessionTitle(session.messages),
  };
}

export function loadChatState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const session = createEmptySession();

      return {
        activeSessionId: session.id,
        sessions: [session],
      };
    }

    const parsed = JSON.parse(raw) as StoredState;

    if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
      const session = createEmptySession();

      return {
        activeSessionId: session.id,
        sessions: [session],
      };
    }

    return {
      activeSessionId: parsed.activeSessionId || parsed.sessions[0].id,
      sessions: parsed.sessions,
    };
  } catch {
    const session = createEmptySession();

    return {
      activeSessionId: session.id,
      sessions: [session],
    };
  }
}

export function saveChatState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
