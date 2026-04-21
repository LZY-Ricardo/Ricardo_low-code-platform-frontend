import { Tabs as AntdTabs } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { parseTabsItems } from './parser'

export default function Tabs({ id, itemsText, styles }: CommonComponentProps) {
  const items = parseTabsItems(typeof itemsText === 'string' ? itemsText : '')

  return (
    <div data-component-id={id} style={styles}>
      <AntdTabs items={items} />
    </div>
  )
}
