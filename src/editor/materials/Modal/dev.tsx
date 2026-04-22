import { Button } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { useThemeColors } from '../../../stores/theme'

export default function Modal({ id, title, content, okText, cancelText, children, styles }: CommonComponentProps) {
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
          width: 480,
          maxWidth: '100%',
          background: 'rgb(var(--bg-secondary))',
          borderRadius: 12,
          border: canDrop ? `2px solid ${themeColors.primary}` : `1px solid rgb(var(--border-light))`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid rgb(var(--border-light))`, fontWeight: 600 }}>
          {typeof title === 'string' && title ? title : '弹窗标题'}
        </div>
        <div style={{ padding: 20, minHeight: 120 }}>
          {children ?? (typeof content === 'string' ? content : '弹窗内容')}
        </div>
        <div style={{ padding: '12px 20px', borderTop: `1px solid rgb(var(--border-light))`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button>{typeof cancelText === 'string' && cancelText ? cancelText : '取消'}</Button>
          <Button type="primary">{typeof okText === 'string' && okText ? okText : '确认'}</Button>
        </div>
      </div>
    </>
  )
}
