import { DatePicker as AntdDatePicker } from 'antd'
import dayjs from 'dayjs'
import type { CommonComponentProps } from '../../interface'
import { normalizeDatePickerValue } from './parser'

export default function DatePicker({ id, placeholder, value, onChange, styles }: CommonComponentProps) {
  const normalizedValue = normalizeDatePickerValue(value)

  return (
    <AntdDatePicker
      id={id !== undefined && id !== null ? String(id) : undefined}
      value={normalizedValue ? dayjs(normalizedValue) : null}
      placeholder={typeof placeholder === 'string' ? placeholder : '请选择日期'}
      onChange={onChange}
      style={styles}
    />
  )
}
