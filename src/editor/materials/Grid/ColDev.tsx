import { Col as AntdCol } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { normalizeGridSpan } from './props'

export default function ColDev({ id, span, children, styles }: CommonComponentProps) {
  const { canDrop, dropRef, contextHolder } = useMaterialDrop(
    ['Button', 'Container', 'Text', 'Image', 'Title', 'Input', 'Card', 'Table', 'Modal', 'Tabs', 'Select', 'Switch', 'DatePicker', 'Form', 'Divider', 'Tag'],
    id,
  )

  return (
    <>
      {contextHolder}
      <AntdCol
        data-component-id={id}
        ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
        span={normalizeGridSpan(span)}
        style={{
          ...styles,
          minHeight: 80,
          border: canDrop ? '2px solid #1677ff' : '1px dashed #d9d9d9',
          borderRadius: 8,
          padding: 12,
          background: '#fafafa',
        }}
      >
        {children}
      </AntdCol>
    </>
  )
}
