import { Tooltip } from 'antd'
import { useDrag } from 'react-dnd'
import type { LegacyRef } from 'react'

export interface MaterialItemProps {
  name: string
  tooltip?: string
}

export default function MaterialItem(props: MaterialItemProps) {
  const [, dragRef] = useDrag(() => ({
    type: props.name,
    item: {  // 被拖动的内容
      type: props.name
    }
  }))
  
  return (
    <Tooltip title={props.tooltip} mouseEnterDelay={0.25}>
      <div
        ref={dragRef as unknown as LegacyRef<HTMLDivElement>}
        tabIndex={0}
        aria-label={props.tooltip ? `${props.name}，${props.tooltip}` : props.name}
        className='
          border-dashed
          border-2
          border-border-light
          rounded-lg
          py-3
          px-4
          inline-block
          bg-bg-secondary
          m-2
          cursor-move
          transition-all
          duration-200
          hover:border-accent
          hover:bg-accent/5
          hover:shadow-soft
          active:scale-95
          text-text-primary
          font-medium
          focus:outline-none
          focus:border-accent
          focus:bg-accent/5
          focus:shadow-soft
        '
      >
        {props.name}
      </div>
    </Tooltip>
  )
}
