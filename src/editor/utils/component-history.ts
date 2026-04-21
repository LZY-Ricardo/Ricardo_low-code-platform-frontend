import type { EditorComponent } from './component-tree'

export interface ComponentHistoryState {
  past: EditorComponent[][]
  present: EditorComponent[]
  future: EditorComponent[][]
}

export function createHistoryState(present: EditorComponent[]): ComponentHistoryState {
  return {
    past: [],
    present,
    future: [],
  }
}

export function pushHistory(
  history: ComponentHistoryState,
  nextPresent: EditorComponent[],
): ComponentHistoryState {
  return {
    past: [...history.past, history.present],
    present: nextPresent,
    future: [],
  }
}

export function undoHistory(history: ComponentHistoryState): ComponentHistoryState {
  if (!history.past.length) {
    return history
  }

  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redoHistory(history: ComponentHistoryState): ComponentHistoryState {
  if (!history.future.length) {
    return history
  }

  const [next, ...restFuture] = history.future
  return {
    past: [...history.past, history.present],
    present: next,
    future: restFuture,
  }
}

export function applyHistorySnapshot(
  _history: ComponentHistoryState,
  present: EditorComponent[],
): ComponentHistoryState {
  return {
    past: [],
    present,
    future: [],
  }
}
