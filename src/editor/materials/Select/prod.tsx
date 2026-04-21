import { Select as AntdSelect } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeSelectOptions, parseSelectOptions } from './parser'

export default function Select({ id, placeholder, optionsText, value, options, onChange, styles }: CommonComponentProps) {
  const resolvedOptions = Array.isArray(options)
    ? normalizeSelectOptions(options)
    : parseSelectOptions(typeof optionsText === 'string' ? optionsText : '')

  return (
    <AntdSelect
      id={id !== undefined && id !== null ? String(id) : undefined}
      value={typeof value === 'string' ? value : undefined}
      placeholder={typeof placeholder === 'string' ? placeholder : '请选择'}
      options={resolvedOptions}
      onChange={onChange}
      style={{ width: '100%', ...styles }}
    />
  )
}
