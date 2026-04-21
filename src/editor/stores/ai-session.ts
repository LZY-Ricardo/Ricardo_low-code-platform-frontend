import { create } from 'zustand';

export interface AiTurn {
  mode: 'generate-page' | 'edit-selection' | 'bind-data' | 'generate-action';
  prompt: string;
  summary: string;
}

interface AiSessionState {
  turns: AiTurn[];
  summary: string;
}

interface AiSessionActions {
  pushTurn: (turn: AiTurn) => void;
  clear: () => void;
}

export const useAiSessionStore = create<AiSessionState & AiSessionActions>((set, get) => ({
  turns: [],
  summary: '',

  pushTurn: (turn) => {
    const turns = [...get().turns, turn].slice(-6);
    const summary = turns
      .map((item, index) => `${index + 1}. [${item.mode}] ${item.prompt} -> ${item.summary}`)
      .join('\n');
    set({ turns, summary });
  },

  clear: () => {
    set({ turns: [], summary: '' });
  },
}));
