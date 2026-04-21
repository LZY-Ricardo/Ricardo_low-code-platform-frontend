import { useDrag } from 'react-dnd'
import type { LegacyRef } from 'react'

export interface MaterialItemProps {
  name: string
}

export default function MaterialItem(props: MaterialItemProps) {
  const [, dragRef] = useDrag(() => ({
    type: props.name,
    item: {  // 被拖动的内容
      type: props.name
    }
  }))
  
  return (
    <div
      ref={dragRef as unknown as LegacyRef<HTMLDivElement>}
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
      '
    >
      {props.name}
    </div>
  )
}
