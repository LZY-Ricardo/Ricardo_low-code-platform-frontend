/**
 * 事件处理器 Hook
 * 
 * 为指定组件生成所有支持的事件处理器函数
 * 这些处理器会在事件触发时查找组件的事件配置并执行相应的动作
 * 
 * @param componentId - 组件 ID
 * @returns 返回包含所有事件处理器的对象
 * 
 * @example
 * ```tsx
 * const handlers = useEventHandlers(123)
 * <Button onClick={handlers.onClick}>点击我</Button>
 * ```
 */
import { useCallback } from 'react'
import { useComponentsStore, getComponentById } from '../stores/components'
import { useRuntimeStateStore } from '../stores/runtime-state'
import { eventExecutor } from '../utils/event-executor'
import type { EventContext, EventType } from '../types/event'

export function useEventHandlers(componentId: number) {
    const components = useComponentsStore((state) => state.components)
    const updateComponentProps = useComponentsStore((state) => state.updateComponentProps)
    const requestResults = useRuntimeStateStore((state) => state.requestResults)
    const variables = useRuntimeStateStore((state) => state.variables)

    /**
     * 创建事件处理器的工厂函数
     * 
     * @param eventType - 事件类型
     * @returns 返回事件处理函数
     * 
     * 处理流程：
     * 1. 获取组件实例
     * 2. 检查是否有对应的事件配置
     * 3. 构建事件上下文
     * 4. 调用事件执行引擎执行动作
     */
    const createEventHandler = useCallback((eventType: EventType) => {
        return (eventData?: unknown) => {
            // 获取组件实例
            const component = getComponentById(componentId, components)

            // 如果组件不存在或没有配置该事件，直接返回
            if (!component?.events?.[eventType]) {
                return
            }

            // 获取事件配置
            const event = component.events[eventType]

            // 构建事件上下文，提供给动作执行器使用
            const context: EventContext = {
                componentId,              // 触发事件的组件 ID
                eventType,                // 事件类型
                eventData,                // 事件数据（如 onChange 的新值）
                components,               // 所有组件数组
                variables,
                requestResults,
                getComponentById: (id: number) => getComponentById(id, components),  // 获取组件的函数
                updateComponentProps,     // 更新组件属性的函数
            }

            // 执行事件动作
            eventExecutor.executeAction(event, context)
        }
    }, [componentId, components, requestResults, updateComponentProps, variables])

    // 返回所有支持的事件处理器
    return {
        onClick: createEventHandler('onClick'),
        onDoubleClick: createEventHandler('onDoubleClick'),
        onChange: createEventHandler('onChange'),
        onFocus: createEventHandler('onFocus'),
        onBlur: createEventHandler('onBlur'),
        onMouseEnter: createEventHandler('onMouseEnter'),
        onMouseLeave: createEventHandler('onMouseLeave'),
    }
}

