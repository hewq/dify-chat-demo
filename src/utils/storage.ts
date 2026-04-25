import type { Message } from "../types/chat";

const STORAGE_KEY = "frontend-ai-assistant-state";

type StoredState = {
  messages: Message[];
  conversationId?: string;
};

export function loadChatState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        messages: [],
        conversationId: undefined,
      };
    }

    const parsed = JSON.parse(raw) as StoredState;

    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      conversationId: parsed.conversationId,
    };
  } catch {
    return {
      messages: [],
      conversationId: undefined,
    };
  }
}

export function saveChatState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearChatState() {
  localStorage.removeItem(STORAGE_KEY);
}
