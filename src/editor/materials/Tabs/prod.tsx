import { Tabs as AntdTabs } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { parseTabsItems } from './parser'

export default function Tabs({ id, itemsText, styles }: CommonComponentProps) {
  const items = parseTabsItems(typeof itemsText === 'string' ? itemsText : '')

  return (
    <AntdTabs
      id={id !== undefined && id !== null ? String(id) : undefined}
      items={items}
      style={styles}
    />
  )
}
