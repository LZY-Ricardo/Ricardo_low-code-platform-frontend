import type { CommonComponentProps } from '../../interface'
import type { LegacyRef } from 'react'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'
import { useThemeColors } from '../../../stores/theme'

export default function Container({ id, children, styles }: CommonComponentProps) {

    const { canDrop, dropRef, contextHolder } = useMaterialDrop(['Button', 'Container', 'Text', 'Image', 'Title', 'Input', 'Card', 'Table', 'Modal', 'Tabs', 'Select', 'Switch', 'DatePicker', 'Form', 'Divider', 'Tag', 'Row', 'Col'], id)
    const themeColors = useThemeColors()

    return (
        <>
            {contextHolder}  {/* 消息提示容器 */}
            <div
                data-component-id={id}
                ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
                className={`
          min-h-[100px]
          p-[20px]
          ${canDrop ? 'border-[2px]' : 'border-[1px]'}
        `}
                style={{
                    ...styles,
                    borderColor: canDrop ? themeColors.primary : undefined,
                }}
            >
                {children}
            </div>
        </>
    )
}
