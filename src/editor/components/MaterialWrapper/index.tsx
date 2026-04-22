import { useState } from 'react'
import Material from '../Materail'
import Outline from '../Outline'
import Source from '../Source'
import IntelligencePanel from '../IntelligencePanel'
import AssetPanel from '../AssetPanel'
import { useProjectStore } from '../../stores/project'
import { Tooltip } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { MATERIAL_NAV_GROUPS, MATERIAL_NAV_ITEMS, type MaterialPanelKey } from './material-nav'
import {
  DEFAULT_MATERIAL_NAV_EXPANDED,
  MATERIAL_NAV_COLLAPSED_WIDTH,
  MATERIAL_NAV_EXPANDED_WIDTH,
  getMaterialNavItemPresentation,
} from './material-layout'

export default function MaterialWrapper() {
  const [key, setKey] = useState<MaterialPanelKey>('物料')
  const [expanded, setExpanded] = useState(DEFAULT_MATERIAL_NAV_EXPANDED)
  const currentProject = useProjectStore((state) => state.currentProject)

  return (
    <div className='flex h-full min-h-0 bg-bg-secondary'>
      <aside
        className='flex h-full flex-shrink-0 flex-col border-r border-border-light bg-[linear-gradient(180deg,var(--color-bg-secondary)_0%,#f5f8fc_100%)] shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] transition-[width] duration-200 ease-out'
        style={{ width: expanded ? MATERIAL_NAV_EXPANDED_WIDTH : MATERIAL_NAV_COLLAPSED_WIDTH }}
      >
        <div className='flex h-14 items-center justify-center border-b border-border-light px-2'>
          <Tooltip title={expanded ? '收起导航' : '展开导航'} placement='right'>
            <button
              type='button'
              onClick={() => setExpanded((current) => !current)}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-base text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary'
              aria-label={expanded ? '收起导航' : '展开导航'}
            >
              {expanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
          </Tooltip>
        </div>
        <nav aria-label='编辑器左侧分区' className='flex-1 space-y-3 overflow-y-auto px-2 py-3'>
          {MATERIAL_NAV_GROUPS.map((group) => (
            <div key={group.title} className='space-y-1.5'>
              {expanded ? (
                <div className='px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-text-quaternary'>
                  {group.title}
                </div>
              ) : (
                <div className='mx-auto h-px w-6 bg-border-light' aria-hidden='true' />
              )}
              <div className='space-y-1'>
                {group.keys.map((groupKey) => {
                  const item = MATERIAL_NAV_ITEMS.find((navItem) => navItem.key === groupKey)

                  if (!item) {
                    return null
                  }

                  const isActive = item.key === key
                  const presentation = getMaterialNavItemPresentation(item.key, expanded)
                  const navButton = (
                    <button
                      key={item.key}
                      type='button'
                      onClick={() => setKey(item.key)}
                      aria-pressed={isActive}
                      aria-label={item.key}
                      className={`relative flex h-10 w-full items-center rounded-xl text-sm transition-colors ${
                        expanded ? 'gap-2 px-2.5 justify-start' : 'justify-center px-0'
                      } ${
                        isActive
                          ? 'bg-white/90 text-primary shadow-sm'
                          : 'text-text-secondary hover:bg-white/70 hover:text-text-primary'
                      }`}
                    >
                      {isActive && <span className='absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary' aria-hidden='true' />}
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                          isActive ? 'bg-primary/12' : 'bg-white/20'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {presentation.label ? (
                        <span className='min-w-0 flex-1 truncate text-left font-medium'>{presentation.label}</span>
                      ) : null}
                    </button>
                  )

                  if (presentation.tooltip) {
                    return (
                      <Tooltip key={item.key} title={presentation.tooltip} placement='right'>
                        {navButton}
                      </Tooltip>
                    )
                  }

                  return <div key={item.key}>{navButton}</div>
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className='flex-1 min-w-0 overflow-y-auto bg-white p-4 scrollbar-thin'>
        {key === '物料' && <Material />}
        {key === '资源' && <AssetPanel projectId={currentProject?.id} />}
        {key === '大纲' && <Outline />}
        {key === '源码' && <Source />}
        {key === '智能' && <IntelligencePanel />}
      </div>
    </div>
  )
}
