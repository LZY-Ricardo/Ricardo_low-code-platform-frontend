import { DatePicker as AntdDatePicker } from 'antd'
import dayjs from 'dayjs'
import type { CommonComponentProps } from '../../interface'
import { normalizeDatePickerValue } from './parser'

export default function DatePicker({ id, placeholder, value, styles }: CommonComponentProps) {
  const normalizedValue = normalizeDatePickerValue(value)

  return (
    <div data-component-id={id} style={styles}>
      <AntdDatePicker
        value={normalizedValue ? dayjs(normalizedValue) : null}
        placeholder={typeof placeholder === 'string' ? placeholder : '请选择日期'}
      />
    </div>
  )
}
