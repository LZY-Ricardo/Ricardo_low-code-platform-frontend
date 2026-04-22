import React from 'react'
import { useComponentConfigStore } from '../../stores/component-config'
import { useComponentsStore } from '../../stores/components'
import { useEventHandlers } from '../../hooks/useEventHandlers'
import type { Component } from '../../stores/components'

interface ComponentWrapperProps {
    component: Component
    renderChildren: (components: Component[]) => React.ReactNode
}

/**
 * 组件包装器，用于绑定事件处理器
 */
export default function ComponentWrapper({ component, renderChildren }: ComponentWrapperProps) {
    const componentConfig = useComponentConfigStore((state) => state.componentConfig)
    const mode = useComponentsStore((state) => state.mode)
    const config = componentConfig?.[component.name]

    // 始终调用 hook（React Hooks 规则要求）
    // 但在编辑模式下，事件处理器不会被使用
    const eventHandlers = useEventHandlers(component.id)

    if (!config?.dev) {
        return null
    }

    // 合并事件处理器（只在预览模式下使用）
    const handlers = mode === 'preview' ? {
        onClick: eventHandlers.onClick,
        onDoubleClick: eventHandlers.onDoubleClick,
        onChange: eventHandlers.onChange,
        onFocus: eventHandlers.onFocus,
        onBlur: eventHandlers.onBlur,
        onMouseEnter: eventHandlers.onMouseEnter,
        onMouseLeave: eventHandlers.onMouseLeave,
    } : {}

    return React.createElement(
        config.dev,
        {
            key: component.id,
            id: component.id,
            name: component.name,
            styles: component.styles,
            ...config.defaultProps,
            ...component.props,
            ...handlers,
        },
        renderChildren(component.children || [])
    )
}

