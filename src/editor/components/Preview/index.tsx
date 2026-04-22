import { useComponentsStore } from '../../stores/components'
import React from 'react'
import type { Component } from '../../stores/components'
import ComponentWithEvents from './ComponentWithEvents'

export default function Preview() {
    const components = useComponentsStore((state) => state.components)

    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component) => {
            return (
                <ComponentWithEvents
                    key={component.id}
                    component={component}
                    renderChildren={renderComponents}
                />
            )
        })
    }

    return (
        <div className='h-full overflow-auto scrollbar-thin bg-bg-primary'>
            <div className='min-h-full p-6'>
                {renderComponents(components)}
            </div>
        </div>
    )
}
