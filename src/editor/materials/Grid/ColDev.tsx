import { Col as AntdCol } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { normalizeGridSpan } from './props'
import { useThemeColors } from '../../../stores/theme'

export default function ColDev({ id, span, children, styles }: CommonComponentProps) {
  const { canDrop, dropRef, contextHolder } = useMaterialDrop(id)
  const themeColors = useThemeColors()

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
          border: canDrop ? `2px solid ${themeColors.primary}` : `1px dashed rgb(var(--border-light))`,
          borderRadius: 8,
          padding: 12,
          background: 'rgb(var(--bg-primary))',
        }}
      >
        {children}
      </AntdCol>
    </>
  )
}
