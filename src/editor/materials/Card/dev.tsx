import { Card as AntdCard } from 'antd'
import type { LegacyRef } from 'react'
import type { CommonComponentProps } from '../../interface'
import { useMaterialDrop } from '../../hooks/useMaterialDrop'

export default function Card({ id, title, children, styles }: CommonComponentProps) {
    const { canDrop, dropRef, contextHolder } = useMaterialDrop(['Button', 'Container', 'Text', 'Image', 'Title', 'Input', 'Table', 'Modal', 'Tabs', 'Select', 'Switch', 'DatePicker', 'Form', 'Divider', 'Tag', 'Row', 'Col'], id)

    return (
        <>
            {contextHolder}
            <AntdCard
                data-component-id={id}
                title={title || '卡片标题'}
                ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
                style={{
                    ...styles,
                    border: canDrop ? '2px solid blue' : undefined,
                    minHeight: canDrop ? '100px' : undefined
                }}
            >
                {children}
            </AntdCard>
        </>
    )
}

