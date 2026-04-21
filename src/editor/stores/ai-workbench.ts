import { create } from 'zustand';

export type AiWorkbenchTaskType =
  | 'generate-page'
  | 'edit-selection'
  | 'bind-data'
  | 'generate-action';

export type AiWorkbenchStatus = 'idle' | 'running' | 'success' | 'error';

export interface AiConversationItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  taskType?: AiWorkbenchTaskType;
}

export interface AiSuggestionItem {
  id: string;
  kind: AiWorkbenchTaskType | 'insight' | 'reuse';
  title: string;
  description?: string;
}

export interface AiHistoryItem {
  taskType: AiWorkbenchTaskType;
  summary: string;
  timestamp?: number;
}

export interface AiApplyLogItem {
  kind: string;
  title: string;
  timestamp?: number;
}

interface AiWorkbenchState {
  activeTaskType: AiWorkbenchTaskType;
  status: AiWorkbenchStatus;
  prompt: string;
  conversation: AiConversationItem[];
  suggestions: AiSuggestionItem[];
  history: AiHistoryItem[];
  applyLog: AiApplyLogItem[];
  lastError: string | null;
}

interface AiWorkbenchActions {
  setActiveTaskType: (taskType: AiWorkbenchTaskType) => void;
  setStatus: (status: AiWorkbenchStatus) => void;
  setPrompt: (prompt: string) => void;
  pushConversation: (item: AiConversationItem) => void;
  setSuggestions: (items: AiSuggestionItem[]) => void;
  pushHistory: (item: AiHistoryItem) => void;
  pushApplyLog: (item: AiApplyLogItem) => void;
  setLastError: (message: string | null) => void;
  hydrateSnapshot: () => void;
  persistSnapshot: () => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'lowcode_ai_workbench';

export const useAiWorkbenchStore = create<AiWorkbenchState & AiWorkbenchActions>((set, get) => ({
  activeTaskType: 'generate-page',
  status: 'idle',
  prompt: '',
  conversation: [],
  suggestions: [],
  history: [],
  applyLog: [],
  lastError: null,

  setActiveTaskType: (taskType) => set({ activeTaskType: taskType }),
  setStatus: (status) => set({ status }),
  setPrompt: (prompt) => set({ prompt }),
  pushConversation: (item) => {
    set((state) => ({
      conversation: [...state.conversation, item].slice(-20),
    }));
  },
  setSuggestions: (items) => set({ suggestions: items }),
  pushHistory: (item) => {
    set((state) => ({
      history: [...state.history, { ...item, timestamp: item.timestamp ?? Date.now() }].slice(-20),
    }));
  },
  pushApplyLog: (item) => {
    set((state) => ({
      applyLog: [...state.applyLog, { ...item, timestamp: item.timestamp ?? Date.now() }].slice(-30),
    }));
  },
  setLastError: (message) => set({ lastError: message }),
  hydrateSnapshot: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AiWorkbenchState>;
      set((state) => ({
        ...state,
        prompt: typeof parsed.prompt === 'string' ? parsed.prompt : state.prompt,
        conversation: Array.isArray(parsed.conversation) ? parsed.conversation : state.conversation,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : state.suggestions,
        history: Array.isArray(parsed.history) ? parsed.history : state.history,
        applyLog: Array.isArray(parsed.applyLog) ? parsed.applyLog : state.applyLog,
      }));
    } catch {
      // ignore invalid snapshot
    }
  },
  persistSnapshot: () => {
    const state = get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        prompt: state.prompt,
        conversation: state.conversation,
        suggestions: state.suggestions,
        history: state.history,
        applyLog: state.applyLog,
      }),
    );
  },
  clearSession: () => {
    const taskType = get().activeTaskType;
    set({
      activeTaskType: taskType,
      status: 'idle',
      prompt: '',
      conversation: [],
      suggestions: [],
      history: [],
      applyLog: [],
      lastError: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
