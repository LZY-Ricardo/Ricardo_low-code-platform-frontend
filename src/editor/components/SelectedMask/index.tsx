import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Space, Popconfirm } from 'antd'
import { getComponentById, useComponentsStore } from '../../stores/components'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'

interface SelectedMaskProps {
    containerClassName: string
    portalWrapperClassName: string
    componentId: number
}

export default function SelectedMask({ containerClassName, portalWrapperClassName, componentId }: SelectedMaskProps) {
    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        labelTop: 0,
        labelLeft: 0,
    })

    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

    const { components, copyComponent, deleteComponent, setCurComponentId } = useComponentsStore()

    // 使用 useCallback 定义 updatePosition，避免依赖问题
    const updatePosition = useCallback(() => {
        if (!componentId) {
            return
        }
        // 获取整个中间画布区域的 div 结构
        const container = document.querySelector(`.${containerClassName}`)
        if (!container) return
        // 被点击的组件的 div 结构
        const node = document.querySelector(`[data-component-id="${componentId}"]`)
        if (!node) return
        // 获取到 node 的几何属性
        const { top, left, width, height } = node.getBoundingClientRect()
        const { top: containerTop, left: containerLeft } = container.getBoundingClientRect()

        let labelTop = top - containerTop + container.scrollTop
        const labelLeft = left - containerLeft + width + container.scrollLeft

        if (labelTop <= 0) {
            labelTop -= -20
        }

        setPosition({
            top: top - containerTop + container.scrollTop,
            left: left - containerLeft + container.scrollLeft,
            width,
            height,
            labelTop,
            labelLeft,
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
    }, [componentId, portalElement, updatePosition, components])

    // 使用 ResizeObserver 监听组件尺寸变化和容器尺寸变化
    useEffect(() => {
        if (!componentId) {
            return
        }

        let componentResizeObserver: ResizeObserver | null = null
        let containerResizeObserver: ResizeObserver | null = null

        // 使用 requestAnimationFrame 确保在 DOM 更新后再查找元素
        const rafId = requestAnimationFrame(() => {
            const node = document.querySelector(`[data-component-id="${componentId}"]`)
            const container = document.querySelector(`.${containerClassName}`)

            if (!node || !container) {
                return
            }

            // 创建 ResizeObserver 来监听组件尺寸变化
            componentResizeObserver = new ResizeObserver(() => {
                // 当组件尺寸改变时，重新计算位置
                updatePosition()
            })

            // 创建 ResizeObserver 来监听容器尺寸变化
            containerResizeObserver = new ResizeObserver(() => {
                // 当容器尺寸改变时（如拖拽右侧面板），重新计算位置
                updatePosition()
            })

            // 开始观察组件元素
            componentResizeObserver.observe(node)
            // 开始观察容器元素
            containerResizeObserver.observe(container as Element)
        })

        // 清理函数：停止观察和取消动画帧
        return () => {
            cancelAnimationFrame(rafId)
            if (componentResizeObserver) {
                componentResizeObserver.disconnect()
            }
            if (containerResizeObserver) {
                containerResizeObserver.disconnect()
            }
        }
    }, [componentId, updatePosition, components, containerClassName])

    useEffect(() => {
        const resizeHandler = () => {
            updatePosition()
        }
        window.addEventListener('resize', resizeHandler)

        return () => {  // 组件卸载时，移除事件监听器
            window.removeEventListener('resize', resizeHandler)
        }
    }, [updatePosition])

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

    const curComponent = useMemo(() => {  // 找到被点击的组件对象
        return getComponentById(componentId, components)
    }, [componentId, components])

    const handleDelete = (e?: React.MouseEvent) => {
        // 阻止事件冒泡，避免触发 EditArea 的点击事件
        e?.stopPropagation()
        // 移除该组件（本质上就是将仓库中的json 数据剔除掉某一个小结点）
        deleteComponent(componentId)
        setCurComponentId(null)
    }

    const handleCopy = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        copyComponent(componentId)
    }

    // 如果 portal 元素不存在，不渲染任何内容
    if (!portalElement) {
        return null
    }

    return createPortal((
        <>
            <div
                style={{
                    position: "absolute",
                    left: position.left,
                    top: position.top,
                    backgroundColor: "rgba(0, 0, 255, 0.1)",
                    border: "1px dashed blue",
                    pointerEvents: "none",
                    width: position.width,
                    height: position.height,
                    zIndex: 14,
                    borderRadius: 4,
                    boxSizing: 'border-box',
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: position.labelLeft,
                    top: position.labelTop,
                    fontSize: "14px",
                    zIndex: 15,
                    display: (!position.width || position.width < 10) ? "none" : "inline",
                    transform: 'translate(-100%, -100%)',
                    pointerEvents: 'auto',
                }}
            >
                <Space>
                    <div
                        style={{
                            padding: '0 8px',
                            backgroundColor: 'blue',
                            borderRadius: 4,
                            color: '#fff',
                            cursor: "pointer",
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {curComponent?.desc}
                    </div>
                    {componentId !== 1 && (
                        <>
                            <div
                                style={{ padding: '0 8px', backgroundColor: 'blue', pointerEvents: 'auto' }}
                                onClick={handleCopy}
                            >
                                <CopyOutlined style={{ color: '#fff', cursor: 'pointer' }} />
                            </div>
                            <div
                                data-delete-button="true"
                                style={{ padding: '0 8px', backgroundColor: 'blue', pointerEvents: 'auto' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Popconfirm
                                    title="确认删除？"
                                    okText={'确认'}
                                    cancelText={'取消'}
                                    onConfirm={handleDelete}
                                >
                                    <DeleteOutlined style={{ color: '#fff', cursor: 'pointer' }} />
                                </Popconfirm>
                            </div>
                        </>
                    )}
                </Space>
            </div>
        </>
    ), portalElement)
}
