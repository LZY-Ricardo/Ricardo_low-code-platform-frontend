export type EditorShortcutAction = 'copy' | 'delete' | 'undo' | 'redo'

export interface EditorShortcutEventLike {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  target: EventTarget | null
}

interface EditableTargetLike {
  tagName?: string
  isContentEditable?: boolean
  closest?: (selector: string) => unknown
}

export function getEditorShortcutAction(event: EditorShortcutEventLike): EditorShortcutAction | null {
  const key = event.key.toLowerCase()
  const hasCommand = event.ctrlKey || event.metaKey

  if (key === 'delete' || key === 'backspace') {
    return 'delete'
  }

  if (!hasCommand) {
    return null
  }

  if (key === 'c') {
    return 'copy'
  }

  if (key === 'z' && !event.shiftKey) {
    return 'undo'
  }

  if ((key === 'z' && event.shiftKey) || key === 'y') {
    return 'redo'
  }

  return null
}

export function isEditableEventTarget(target: EventTarget | null): boolean {
  const element = target as EditableTargetLike | null
  if (!element) {
    return false
  }

  const tagName = element.tagName?.toUpperCase()
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || element.isContentEditable === true
}

export function shouldHandleEditorShortcut(target: EventTarget | null, isCanvasScopeActive: boolean): boolean {
  const element = target as EditableTargetLike | null
  if (!element) {
    return false
  }

  const tagName = element.tagName?.toUpperCase()
  if (tagName === 'BODY' || tagName === 'HTML') {
    return isCanvasScopeActive
  }

  return Boolean(element.closest?.('.edit-area'))
}
