import { Switch as AntdSwitch } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeSwitchValue } from './props'

export default function Switch({ id, checked, checkedText, uncheckedText, onChange, styles }: CommonComponentProps) {
  return (
    <AntdSwitch
      id={id !== undefined && id !== null ? String(id) : undefined}
      checked={normalizeSwitchValue(checked)}
      checkedChildren={typeof checkedText === 'string' ? checkedText : '开'}
      unCheckedChildren={typeof uncheckedText === 'string' ? uncheckedText : '关'}
      onChange={onChange}
      style={styles}
    />
  )
}
