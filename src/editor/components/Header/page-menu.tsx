import type { MenuProps } from 'antd'
import type { EditorPage } from '../../utils/page-model'

interface BuildPageMenuItemsOptions {
  pages: EditorPage[]
  activePageId: string | null
  onSwitchPage: (pageId: string) => void
}

export function buildPageMenuItems({
  pages,
  activePageId,
  onSwitchPage,
}: BuildPageMenuItemsOptions): MenuProps['items'] {
  return pages.map((page) => ({
    key: page.id,
    label: (
      <span>
        {page.name}
        {activePageId === page.id && ' (当前)'}
      </span>
    ),
    onClick: () => onSwitchPage(page.id),
  }))
}
