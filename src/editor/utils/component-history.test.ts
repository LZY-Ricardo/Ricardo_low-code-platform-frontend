import { describe, expect, it } from 'vitest'
import type { EditorComponent } from './component-tree'
import {
  applyHistorySnapshot,
  createHistoryState,
  pushHistory,
  redoHistory,
  undoHistory,
} from './component-history'

const page: EditorComponent = {
  id: 1,
  name: 'Page',
  props: {},
  desc: '页面',
}

describe('component history utilities', () => {
  it('pushes snapshots into past and clears future', () => {
    const history = pushHistory(createHistoryState([page]), [{ ...page, desc: '页面2' }])

    expect(history.past).toHaveLength(1)
    expect(history.present[0].desc).toBe('页面2')
    expect(history.future).toHaveLength(0)
  })

  it('undoes and redoes snapshots in order', () => {
    const initial = createHistoryState([page])
    const next = pushHistory(initial, [{ ...page, desc: '第一次修改' }])
    const afterUndo = undoHistory(next)
    const afterRedo = redoHistory(afterUndo)

    expect(afterUndo.present[0].desc).toBe('页面')
    expect(afterRedo.present[0].desc).toBe('第一次修改')
  })

  it('applies external snapshots without polluting undo stack', () => {
    const history = pushHistory(createHistoryState([page]), [{ ...page, desc: '编辑中' }])
    const synced = applyHistorySnapshot(history, [{ ...page, desc: '服务端版本' }])

    expect(synced.past).toHaveLength(0)
    expect(synced.future).toHaveLength(0)
    expect(synced.present[0].desc).toBe('服务端版本')
  })
})
