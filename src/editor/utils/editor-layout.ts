export interface EditorPaneLayout {
  preferredSize: number
  minSize: number
  maxSize: number
}

export interface EditorLayoutState {
  version: number
  left: EditorPaneLayout
  right: EditorPaneLayout
}

const DEFAULT_LEFT_PANE: EditorPaneLayout = {
  preferredSize: 353,
  minSize: 200,
  maxSize: 1200,
}

const DEFAULT_RIGHT_PANE: EditorPaneLayout = {
  preferredSize: 300,
  minSize: 300,
  maxSize: 500,
}

export function createDefaultEditorLayoutState(version = 0): EditorLayoutState {
  return {
    version,
    left: { ...DEFAULT_LEFT_PANE },
    right: { ...DEFAULT_RIGHT_PANE },
  }
}

export function resetEditorLayoutState(current: EditorLayoutState): EditorLayoutState {
  return createDefaultEditorLayoutState(current.version + 1)
}
