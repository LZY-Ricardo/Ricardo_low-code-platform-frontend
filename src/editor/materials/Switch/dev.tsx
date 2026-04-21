import { Switch as AntdSwitch } from 'antd'
import type { CommonComponentProps } from '../../interface'
import { normalizeSwitchValue } from './props'

export default function Switch({ id, checked, checkedText, uncheckedText, styles }: CommonComponentProps) {
  return (
    <div data-component-id={id} style={styles}>
      <AntdSwitch
        checked={normalizeSwitchValue(checked)}
        checkedChildren={typeof checkedText === 'string' ? checkedText : '开'}
        unCheckedChildren={typeof uncheckedText === 'string' ? uncheckedText : '关'}
      />
    </div>
  )
}
