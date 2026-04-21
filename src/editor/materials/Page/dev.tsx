import type { CommonComponentProps } from '../../interface'
import type { LegacyRef } from 'react'
// import { useDrop } from 'react-dnd'
// import { message } from 'antd'
// import { useComponentsStore } from '../../stores/components'
// import { useComponentConfigStore } from '../../stores/component-config'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'

export default function Page({ id, children, styles }: CommonComponentProps) {

    // const [messageApi, contextHolder] = message.useMessage();
    // const { addComponent } = useComponentsStore()
    // const { componentConfig } = useComponentConfigStore()
    // const [{canDrop}, dropRef] = useDrop(() => ({
    //   accept: ['Button', 'Container', 'Page'],
    //   drop: (item: {type: string}, monitor) => {
    //     const didDrop = monitor.didDrop()  // 是否被动冒泡接受其他组件
    //     if (didDrop) return

    //     messageApi.success(item.type)
    //     // 将该组件的对象植入到 json 中
    //     const props = componentConfig?.[item.type]?.defaultProps
    //     addComponent({
    //       id: new Date().getTime(),
    //       name: item.type,
    //       props: props
    //     }, id)
    //   },
    //   collect: (monitor) => {  // 接受区域
    //     return {
    //       canDrop: monitor.canDrop()
    //     }
    //   }
    // }))

    const { canDrop, dropRef, contextHolder } = useMaterialDrop(['Button', 'Container', 'Text', 'Image', 'Title', 'Input', 'Card', 'Table', 'Modal', 'Tabs', 'Select', 'Switch', 'DatePicker', 'Form', 'Divider', 'Tag', 'Row', 'Col'], id)

    return (
        <>
            {contextHolder}
            <div
                data-component-id={id}
                ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
                className='p-[20px] h-[100%] box-border'
                style={{ ...styles, border: canDrop ? '2px solid blue' : 'none' }}
            >
                {children}
            </div>
        </>
    )
}
