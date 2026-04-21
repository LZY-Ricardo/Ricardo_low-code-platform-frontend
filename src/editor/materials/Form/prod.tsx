import { Form as AntdForm } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeFormLayout } from './props'

export default function Form({ title, layout, children, styles }: CommonComponentProps) {
  return (
    <div style={styles}>
      {typeof title === 'string' && title ? (
        <div style={{ marginBottom: 16, fontWeight: 600 }}>{title}</div>
      ) : null}
      <AntdForm layout={normalizeFormLayout(layout)}>
        {children}
      </AntdForm>
    </div>
  )
}
