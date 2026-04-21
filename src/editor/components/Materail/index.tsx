import { useMemo } from 'react'
import { useComponentConfigStore } from '../../stores/component-config'
import MaterialItem from '../MaterialItem'

export default function Materail() {
  const { componentConfig } = useComponentConfigStore()
  const components = useMemo(() => {
    return Object.values(componentConfig).filter(item => item.name !== 'Page')  // [{xx}, {xx}, {xx}]
  }, [componentConfig])

  return (
    <div>
      {
        components.map((item, index) => {
          return <MaterialItem key={item.name + index} name={item.name} tooltip={item.tooltip} />
        })
      }
    </div>
  )
}
