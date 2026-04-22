import React, { useState } from 'react'
import { useComponentsStore } from '../../stores/components'
import type { Component } from '../../stores/components'
import { useComponentConfigStore } from '../../stores/component-config'
import { useRuntimeStateStore } from '../../stores/runtime-state'
import { useSharedStylesStore } from '../../stores/shared-styles'
import HoverMask from '../HoverMask'
import SelectedMask from '../SelectedMask'
import { resolveBindingsMap } from '../../utils/binding'
import {
    editAreaCanvasFrameClassName,
    editAreaCanvasScalerClassName,
} from '../../utils/page-canvas-layout'

export default function EditArea() {
    const components = useComponentsStore((state) => state.components)
    const setCurComponentId = useComponentsStore((state) => state.setCurComponentId)
    const curComponentId = useComponentsStore((state) => state.curComponentId)
    const canvasScale = useComponentsStore((state) => state.canvasScale)
    const componentConfig = useComponentConfigStore((state) => state.componentConfig)
    const variables = useRuntimeStateStore((state) => state.variables)
    const requestResults = useRuntimeStateStore((state) => state.requestResults)
    const sharedStyles = useSharedStylesStore((state) => state.sharedStyles)
    const [hoverComponentId, setHoverComponentId] = useState<number>()

    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component: Component) => {
            const config = componentConfig?.[component.name]
            if (!config?.dev) { // 没有对应的组件，比如：'Page'
                return null
            }
            // 渲染组件（仅当允许包含子节点时才传 children）
            const elementProps = {
                key: component.id,
                id: component.id,
                name: component.name,
                styles: {
                    ...(sharedStyles.find((item) => item.id === component.sharedStyleId)?.styles ?? {}),
                    ...component.styles,
                },
                ...config.defaultProps,
                ...resolveBindingsMap(component.props, component.bindings, {
                    variables,
                    requestResults,
                }),
            }
            if (config.allowChildren && (component.children?.length || 0) > 0) {
                return React.createElement(
                    config.dev,
                    elementProps,
                    renderComponents(component.children || [])  // 递归渲染整个 json 树
                )
            }
            return React.createElement(config.dev, elementProps)
        })
    }

    const handleMouseOver: React.MouseEventHandler = (e) => {
        // console.log(e.nativeEvent.composedPath());
        const path = e.nativeEvent.composedPath()
        for (let i = 0; i < path.length; i++) {
            const ele = path[i] as HTMLElement
            const componentId = ele.dataset && ele.dataset.componentId
            if (componentId) {
                setHoverComponentId(+componentId)
                return
            }
        }
    }

    // 借助冒泡机制，点击页面上的任何组件，点击行为都会冒泡到这里
    const handleClick: React.MouseEventHandler = (e) => {
        // 检查是否点击了删除按钮或 Popconfirm
        const target = e.target as HTMLElement
        if (target.closest('.ant-popconfirm') || target.closest('[data-delete-button]')) {
            return // 如果点击的是删除相关元素，不处理选择逻辑
        }

        // console.log(e.nativeEvent.composedPath());
        const path = e.nativeEvent.composedPath()
        for (let i = 0; i < path.length; i++) {
            const ele = path[i] as HTMLElement
            const componentId = ele.dataset && ele.dataset.componentId
            if (componentId) {
                setCurComponentId(+componentId)
                return
            }
        }

    }

    return (
        <div className='h-[100%] edit-area overflow-auto scrollbar-thin relative'
            onMouseOver={handleMouseOver}
            onMouseLeave={() => setHoverComponentId(undefined)}
            onClick={handleClick}
        >
            <div className='min-h-full p-6'>
                <div className={editAreaCanvasFrameClassName}>
                    <div
                        className={editAreaCanvasScalerClassName}
                        style={{ transform: `scale(${canvasScale})` }}
                    >
                        {components && renderComponents(components)}
                    </div>
                </div>
            </div>
            {hoverComponentId && hoverComponentId !== curComponentId && (
                <HoverMask
                    componentId={hoverComponentId}
                    containerClassName='edit-area'
                    portalWrapperClassName='portal-wrapper'
                />
            )}
            {curComponentId && (
                <SelectedMask
                    componentId={curComponentId}
                    containerClassName='edit-area'
                    portalWrapperClassName='portal-wrapper'
                />
            )}
            <div className="portal-wrapper" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}></div>
        </div>
    )
}
