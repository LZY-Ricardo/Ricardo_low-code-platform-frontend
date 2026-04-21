import type { MenuProps } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import type { EditorPage } from '../../utils/page-model'
import { buildPageMenuItems } from './page-menu'

describe('page menu items', () => {
  it('binds page switching to menu item clicks', () => {
    const onSwitchPage = vi.fn()
    const pages: EditorPage[] = [
      { id: 'page_1', name: '页面 1', components: [] },
      { id: 'page_2', name: '页面 2', components: [] },
    ]

    const items = buildPageMenuItems({
      pages,
      activePageId: 'page_1',
      onSwitchPage,
    })

    const secondItem = items?.[1] as NonNullable<MenuProps['items']>[number] & { onClick?: (info: unknown) => void }

    expect(items).toHaveLength(2)
    expect(secondItem.onClick).toBeTypeOf('function')

    secondItem.onClick?.({})

    expect(onSwitchPage).toHaveBeenCalledWith('page_2')
  })
})
