import { Form as AntdForm, Tag } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { normalizeFormLayout } from './props'
import { useThemeColors } from '../../../stores/theme'

export default function Form({ id, title, layout, children, styles, collectData, formId }: CommonComponentProps) {
  const { canDrop, dropRef, contextHolder } = useMaterialDrop(id)
  const themeColors = useThemeColors()

  return (
    <>
      {contextHolder}
      <div
        data-component-id={id}
        ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
        style={{
          ...styles,
          padding: 20,
          borderRadius: 12,
          border: canDrop ? `2px solid ${themeColors.primary}` : `1px dashed rgb(var(--border-light))`,
          background: 'rgb(var(--bg-secondary))',
          minHeight: 160,
        }}
      >
        <div style={{ marginBottom: 16, fontWeight: 600 }}>
          <div className='flex items-center gap-2'>
            <span>{typeof title === 'string' && title ? title : '表单'}</span>
            {collectData ? <Tag color="green">收集开启</Tag> : null}
            {collectData && formId ? <Tag>{formId}</Tag> : null}
          </div>
        </div>
        <AntdForm layout={normalizeFormLayout(layout)}>
          {children ?? <div style={{ color: 'rgb(var(--text-secondary))' }}>拖入表单组件</div>}
        </AntdForm>
      </div>
    </>
  )
}
