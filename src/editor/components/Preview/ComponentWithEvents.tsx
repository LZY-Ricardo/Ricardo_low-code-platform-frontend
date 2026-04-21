/**
 * 带事件处理的组件包装器
 * 
 * 在预览模式下，为组件绑定事件处理器
 * 当用户交互触发事件时，会自动执行配置的动作
 * 
 * 使用场景：
 * - 预览模式下的组件渲染
 * - 需要自动绑定事件处理器的场景
 * 
 * @param component - 要渲染的组件数据
 * @param renderChildren - 渲染子组件的函数
 */
import React from 'react'
import { useComponentConfigStore } from '../../stores/component-config'
import { useEventHandlers } from '../../hooks/useEventHandlers'
import type { Component } from '../../stores/components'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import { resolveBindingsMap } from '../../utils/binding'

interface ComponentWithEventsProps {
    /** 组件数据 */
    component: Component
    /** 渲染子组件的函数 */
    renderChildren: (components: Component[]) => React.ReactNode
}

export default function ComponentWithEvents({ component, renderChildren }: ComponentWithEventsProps) {
    const { componentConfig } = useComponentConfigStore()
    const config = componentConfig?.[component.name]
    const variables = useRuntimeStateStore((state) => state.variables)
    const requestResults = useRuntimeStateStore((state) => state.requestResults)
    const sharedStyles = useSharedStylesStore((state) => state.sharedStyles)

    // 获取组件的事件处理器（所有支持的事件类型）
    const eventHandlers = useEventHandlers(component.id)

    if (!config?.prod) {
        return null
    }

    // 使用 React.createElement 动态创建组件
    // 将事件处理器绑定到组件 props 中
    const elementProps = {
        key: component.id,
        id: component.id,
        name: component.name,
        styles: {
            ...(sharedStyles.find((item) => item.id === component.sharedStyleId)?.styles ?? {}),
            ...component.styles,
        },
        ...config.defaultProps,      // 默认属性
        ...resolveBindingsMap(component.props, component.bindings, {
            variables,
            requestResults,
        }),          // 组件自定义属性
        // 绑定事件处理器，当事件触发时会执行配置的动作
        onClick: eventHandlers.onClick,
        onDoubleClick: eventHandlers.onDoubleClick,
        onChange: eventHandlers.onChange,
        onFocus: eventHandlers.onFocus,
        onBlur: eventHandlers.onBlur,
        onMouseEnter: eventHandlers.onMouseEnter,
        onMouseLeave: eventHandlers.onMouseLeave,
    }

    // 仅当组件允许包含子节点时，才传入 children
    if (config.allowChildren && (component.children?.length || 0) > 0) {
        return React.createElement(
            config.prod,
            elementProps,
            renderChildren(component.children || [])
        )
    }
    return React.createElement(config.prod, elementProps)
}

