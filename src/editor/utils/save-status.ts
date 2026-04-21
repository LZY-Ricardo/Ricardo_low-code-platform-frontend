export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export function shouldMarkDirty(currentSnapshot: string, persistedSnapshot: string): boolean {
  return currentSnapshot !== persistedSnapshot
}

export function formatSaveStatusText(status: SaveStatus): string {
  switch (status) {
    case 'dirty':
      return '未保存'
    case 'saving':
      return '保存中...'
    case 'saved':
      return '已保存'
    case 'error':
      return '保存失败'
    default:
      return '就绪'
  }
}
