import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getComponentById, useComponentsStore } from '../../stores/components'
import { useThemeColors } from '../../../stores/theme'

interface HoverMaskProps {
    containerClassName: string
    componentId: number,
    portalWrapperClassName: string
}

// HoverMask 会在鼠标移入组件时显示，并能完整覆盖整个组件
export default function HoverMask({ containerClassName, componentId, portalWrapperClassName }: HoverMaskProps) {
    const components = useComponentsStore((state) => state.components)
    const themeColors = useThemeColors()

    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        labelTop: 0,
        labelLeft: 0,
    })

    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

    // 使用 useCallback 定义 updatePosition
    const updatePosition = useCallback(() => {
        if (!componentId) return

        const container = document.querySelector(`.${containerClassName}`)
        if (!container) return

        const node = document.querySelector(`[data-component-id="${componentId}"]`)
        if (!node) return

        const { top, left, width, height } = node.getBoundingClientRect()
        const { top: containerTop, left: containerLeft } = container.getBoundingClientRect()

        setPosition({
            top: top - containerTop + container.scrollTop,
            left: left - containerLeft + container.scrollLeft,
            width,
            height,
            labelTop: top - containerTop + container.scrollTop,
            labelLeft: left - containerLeft + width + container.scrollLeft,
        })
    }, [componentId, containerClassName])

    // 动态查找 portal 容器元素
    useEffect(() => {
        const findPortalElement = () => {
            const el = document.querySelector(`.${portalWrapperClassName}`) as HTMLElement
            if (el) {
                setPortalElement(el)
            } else {
                // 如果找不到，延迟重试（DOM 可能还在渲染中）
                setTimeout(() => {
                    const retryEl = document.querySelector(`.${portalWrapperClassName}`) as HTMLElement
                    if (retryEl) {
                        setPortalElement(retryEl)
                    }
                }, 0)
            }
        }

        findPortalElement()

        // 监听 DOM 变化，确保能找到元素
        const observer = new MutationObserver(() => {
            const el = document.querySelector(`.${portalWrapperClassName}`) as HTMLElement
            if (el) {
                setPortalElement(el)
            }
        })

        // 观察整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        return () => {
            observer.disconnect()
        }
    }, [portalWrapperClassName])

    useEffect(() => {
        updatePosition()
    }, [componentId, portalElement, updatePosition])

    // 监听容器滚动事件，确保滚动时遮罩层位置正确
    useEffect(() => {
        if (!componentId) {
            return
        }

        const container = document.querySelector(`.${containerClassName}`)
        if (!container) {
            return
        }

        const scrollHandler = () => {
            updatePosition()
        }

        container.addEventListener('scroll', scrollHandler, { passive: true })

        return () => {
            container.removeEventListener('scroll', scrollHandler)
        }
    }, [componentId, containerClassName, updatePosition])

    const curComponent = useMemo(() => {
        return getComponentById(componentId, components)
    }, [componentId, components])

    // 如果 portal 元素不存在，不渲染任何内容
    if (!portalElement) {
        return null
    }

    return createPortal((
        <>
            <div style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                backgroundColor: themeColors.primaryAlpha(0.1),
                border: `1px dashed ${themeColors.primary}`,
                borderRadius: 4,
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 12
            }}></div>

            <div
                style={{
                    position: 'absolute',
                    top: position.labelTop,
                    left: position.labelLeft,
                    fontSize: 14,
                    zIndex: 13,
                    display: (!position.width || position.width < 10) ? 'none' : 'inline-block',
                    transform: 'translate(-100%, -100%)'
                }}
            >
                <div
                    style={{
                        padding: '0px 8px',
                        backgroundColor: themeColors.primary,
                        color: '#fff',
                        borderRadius: 4,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >{curComponent?.desc}</div>
            </div>
        </>
    ), portalElement)
}
