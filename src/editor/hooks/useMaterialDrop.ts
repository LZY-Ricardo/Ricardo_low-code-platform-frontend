import { useDrop } from 'react-dnd'
import { useComponentsStore } from '../stores/components'
import { useComponentConfigStore } from '../stores/component-config'
import { message } from 'antd'
import { createComponentInstance } from '../utils/component-factory'

// accept: string[] ：可接受的组件类型数组，如 ['Button', 'Container']
// id: number ：当前组件的id，用于添加组件时指定父组件
export function useMaterialDrop(accept: string[], id: number) {
  const { addComponent } = useComponentsStore()
  const { componentConfig } = useComponentConfigStore()
  const [messageApi, contextHolder] = message.useMessage();

  const [{ canDrop }, dropRef] = useDrop(() => {
    return {
      accept, // 可接受的组件类型数组
      drop: (item: { type: string }, monitor) => { // 处理拖拽组件释放时的逻辑
        // 在嵌套容器场景中, 拖拽事件会冒泡到多个容器
        // 通过 didDrop 检查是否已被其他容器接收 确保组件只被最内层的容器接收
        const didDrop = monitor.didDrop()  // 是否被动冒泡接受其他组件 检查是否已被其他容器接收
        if (didDrop) return // 防止重复处理
        messageApi.success(item.type)
        const component = createComponentInstance(componentConfig, item.type, Date.now())
        addComponent(component, id) // 添加到指定容器
      },
      collect: (monitor) => { // 收集拖拽状态信息
        return {
          canDrop: monitor.canDrop() // 是否可以接收当前拖拽组件
          // 布尔值 表示当前是否有可接受的组件正在拖拽
          // 用于提供视觉反馈(如改变拖拽区域的背景颜色)
        }
      }
    }
  })

  return {
    canDrop, // 拖拽状态
    dropRef, // 绑定到容器 DOM 的 ref
    contextHolder // 消息提示的容器组件
  }
}
