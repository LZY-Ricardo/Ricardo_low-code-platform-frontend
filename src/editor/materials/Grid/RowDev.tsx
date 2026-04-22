import { Row as AntdRow } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { useThemeColors } from '../../../stores/theme'

export default function RowDev({ id, gutter, children, styles }: CommonComponentProps) {
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
          border: canDrop ? `2px solid ${themeColors.primary}` : `1px dashed rgb(var(--border-light))`,
          borderRadius: 12,
          padding: 12,
          minHeight: 100,
          background: 'rgb(var(--bg-secondary))',
        }}
      >
        <AntdRow gutter={typeof gutter === 'number' ? gutter : 16}>
          {children}
        </AntdRow>
      </div>
    </>
  )
}
