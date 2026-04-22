import type { ReactNode } from 'react'
import {
  AppstoreOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  NodeIndexOutlined,
  RobotOutlined,
} from '@ant-design/icons'

export type MaterialPanelKey = '物料' | '资源' | '大纲' | '源码' | '智能'

export interface MaterialNavItem {
  key: MaterialPanelKey
  icon: ReactNode
}

export interface MaterialNavGroup {
  title: string
  keys: MaterialPanelKey[]
}

export const MATERIAL_NAV_ITEMS: MaterialNavItem[] = [
  { key: '物料', icon: <AppstoreOutlined /> },
  { key: '资源', icon: <FolderOpenOutlined /> },
  { key: '大纲', icon: <NodeIndexOutlined /> },
  { key: '源码', icon: <CodeOutlined /> },
  { key: '智能', icon: <RobotOutlined /> },
]

export const MATERIAL_NAV_GROUPS: MaterialNavGroup[] = [
  {
    title: '高频',
    keys: ['物料', '大纲', '智能'],
  },
  {
    title: '扩展',
    keys: ['资源', '源码'],
  },
]
