import { Form as AntdForm } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { normalizeFormLayout } from './props'

export default function Form({ id, title, layout, children, styles }: CommonComponentProps) {
  const { canDrop, dropRef, contextHolder } = useMaterialDrop(
    ['Button', 'Container', 'Text', 'Title', 'Input', 'Select', 'Switch', 'DatePicker', 'Divider'],
    id,
  )

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
          border: canDrop ? '2px solid #1677ff' : '1px dashed #d9d9d9',
          background: '#fff',
          minHeight: 160,
        }}
      >
        <div style={{ marginBottom: 16, fontWeight: 600 }}>
          {typeof title === 'string' && title ? title : '表单'}
        </div>
        <AntdForm layout={normalizeFormLayout(layout)}>
          {children ?? <div style={{ color: '#999' }}>拖入表单组件</div>}
        </AntdForm>
      </div>
    </>
  )
}
