import { useState } from 'react'
import { Segmented } from 'antd';
import ComponentAttr from './ComponentAttr'
import ComponentStyle from './ComponentStyle'
import ComponentEvent from './ComponentEvent'
import DataSourcePanel from './DataSourcePanel'
import DataBindingPanel from './DataBindingPanel'
import VariablePanel from './VariablePanel'

export default function Setting() {
    const [key, setKey] = useState('属性')

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-border-light bg-bg-secondary">
                <Segmented
                    value={key}
                    options={['属性', '外观', '事件', '数据']}
                    block
                    onChange={setKey}
                    className='shadow-soft'
                />
            </div>
            <div className='flex-1 overflow-y-auto p-4 scrollbar-thin'>
                {
                    key === '属性' && <ComponentAttr />
                }
                {
                    key === '外观' && <ComponentStyle />
                }
                {
                    key === '事件' && <ComponentEvent />
                }
                {
                    key === '数据' && (
                        <div className="space-y-4">
                            <VariablePanel />
                            <DataSourcePanel />
                            <DataBindingPanel />
                        </div>
                    )
                }
            </div>
        </div>
    )
}
