import { describe, expect, it } from 'vitest'
import {
  getEditorShortcutAction,
  shouldHandleEditorShortcut,
  isEditableEventTarget,
  type EditorShortcutEventLike,
} from './editor-shortcuts'

function createEvent(overrides: Partial<EditorShortcutEventLike>): EditorShortcutEventLike {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  }
}

describe('editor shortcuts', () => {
  it('matches copy shortcut on ctrl/cmd + c', () => {
    expect(getEditorShortcutAction(createEvent({ key: 'c', ctrlKey: true }))).toBe('copy')
    expect(getEditorShortcutAction(createEvent({ key: 'C', metaKey: true }))).toBe('copy')
  })

  it('matches undo and redo shortcuts', () => {
    expect(getEditorShortcutAction(createEvent({ key: 'z', ctrlKey: true }))).toBe('undo')
    expect(getEditorShortcutAction(createEvent({ key: 'z', metaKey: true, shiftKey: true }))).toBe('redo')
    expect(getEditorShortcutAction(createEvent({ key: 'y', ctrlKey: true }))).toBe('redo')
  })

  it('matches delete shortcuts', () => {
    expect(getEditorShortcutAction(createEvent({ key: 'Delete' }))).toBe('delete')
    expect(getEditorShortcutAction(createEvent({ key: 'Backspace' }))).toBe('delete')
  })

  it('returns null for unrelated shortcuts', () => {
    expect(getEditorShortcutAction(createEvent({ key: 'a', ctrlKey: true }))).toBeNull()
    expect(getEditorShortcutAction(createEvent({ key: 'Enter' }))).toBeNull()
  })
})

describe('editable target detection', () => {
  it('detects input-like targets', () => {
    expect(isEditableEventTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true)
    expect(isEditableEventTarget({ tagName: 'TEXTAREA' } as unknown as EventTarget)).toBe(true)
    expect(isEditableEventTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget)).toBe(true)
  })

  it('ignores plain non-editable targets', () => {
    expect(isEditableEventTarget({ tagName: 'DIV', isContentEditable: false } as unknown as EventTarget)).toBe(false)
    expect(isEditableEventTarget(null)).toBe(false)
  })
})

describe('editor shortcut scope', () => {
  it('allows shortcuts from canvas targets', () => {
    const canvasTarget = {
      closest: (selector: string) => (selector === '.edit-area' ? {} : null),
      tagName: 'DIV',
      isContentEditable: false,
    }

    expect(shouldHandleEditorShortcut(canvasTarget as never, false)).toBe(true)
  })

  it('blocks shortcuts from non-canvas controls and body without canvas scope', () => {
    const treeTarget = {
      closest: () => null,
      tagName: 'DIV',
      isContentEditable: false,
    }

    expect(shouldHandleEditorShortcut(treeTarget as never, false)).toBe(false)
    expect(shouldHandleEditorShortcut({ tagName: 'BUTTON' } as unknown as EventTarget, false)).toBe(false)
    expect(shouldHandleEditorShortcut({ tagName: 'BODY' } as unknown as EventTarget, false)).toBe(false)
    expect(shouldHandleEditorShortcut({ tagName: 'HTML' } as unknown as EventTarget, false)).toBe(false)
  })

  it('allows body/html target only when canvas scope is active', () => {
    expect(shouldHandleEditorShortcut({ tagName: 'BODY' } as unknown as EventTarget, true)).toBe(true)
    expect(shouldHandleEditorShortcut({ tagName: 'HTML' } as unknown as EventTarget, true)).toBe(true)
  })
})
