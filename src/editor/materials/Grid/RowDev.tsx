import { Row as AntdRow } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'

export default function RowDev({ id, gutter, children, styles }: CommonComponentProps) {
  const { canDrop, dropRef, contextHolder } = useMaterialDrop(
    ['Col', 'Button', 'Container', 'Text', 'Image', 'Title', 'Input', 'Card', 'Table', 'Modal', 'Tabs', 'Select', 'Switch', 'DatePicker', 'Form', 'Divider', 'Tag'],
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
          border: canDrop ? '2px solid #1677ff' : '1px dashed #d9d9d9',
          borderRadius: 12,
          padding: 12,
          minHeight: 100,
          background: '#fff',
        }}
      >
        <AntdRow gutter={typeof gutter === 'number' ? gutter : 16}>
          {children}
        </AntdRow>
      </div>
    </>
  )
}
