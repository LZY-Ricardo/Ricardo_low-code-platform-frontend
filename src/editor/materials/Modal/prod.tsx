import { Modal as AntdModal } from 'antd'
import type { CommonComponentProps } from '../../interface'

export default function Modal({ title, content, okText, cancelText, open, children, styles }: CommonComponentProps) {
  return (
    <AntdModal
      open={typeof open === 'boolean' ? open : true}
      title={typeof title === 'string' ? title : '弹窗标题'}
      okText={typeof okText === 'string' ? okText : '确认'}
      cancelText={typeof cancelText === 'string' ? cancelText : '取消'}
      footer={null}
      styles={styles ? { content: styles } : undefined}
    >
      {children ?? (typeof content === 'string' ? content : '弹窗内容')}
    </AntdModal>
  )
}
