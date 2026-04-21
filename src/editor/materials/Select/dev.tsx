import { Select as AntdSelect } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeSelectOptions, parseSelectOptions } from './parser'

export default function Select({ id, placeholder, optionsText, value, options, styles }: CommonComponentProps) {
  const resolvedOptions = Array.isArray(options)
    ? normalizeSelectOptions(options)
    : parseSelectOptions(typeof optionsText === 'string' ? optionsText : '')

  return (
    <div data-component-id={id} style={styles}>
      <AntdSelect
        value={typeof value === 'string' ? value : undefined}
        placeholder={typeof placeholder === 'string' ? placeholder : '请选择'}
        options={resolvedOptions}
        style={{ width: '100%' }}
      />
    </div>
  )
}
