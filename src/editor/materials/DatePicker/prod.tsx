import { DatePicker as AntdDatePicker } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import type { CommonComponentProps } from '../../interface'
import { getDatePickerNextValue, normalizeDatePickerValue } from './parser'

export default function DatePicker({ id, placeholder, value, onChange, styles }: CommonComponentProps) {
  const normalizedValue = normalizeDatePickerValue(value)
  const [localValue, setLocalValue] = useState<string | undefined>(normalizedValue)

  useEffect(() => {
    setLocalValue(normalizedValue)
  }, [normalizedValue])

  function handleChange(date: unknown, dateString: string | string[]) {
    setLocalValue(getDatePickerNextValue(dateString))
    onChange?.(date, dateString)
  }

  return (
    <AntdDatePicker
      id={id !== undefined && id !== null ? String(id) : undefined}
      value={localValue ? dayjs(localValue) : null}
      placeholder={typeof placeholder === 'string' ? placeholder : '请选择日期'}
      onChange={handleChange}
      style={styles}
    />
  )
}
