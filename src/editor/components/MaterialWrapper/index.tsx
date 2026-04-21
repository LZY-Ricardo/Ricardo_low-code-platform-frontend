import { useState } from 'react'
import { Segmented } from 'antd';
import Material from '../Materail'
import Outline from '../Outline'
import Source from '../Source'
import IntelligencePanel from '../IntelligencePanel'

export default function MaterialWrapper() {
    const [key, setKey] = useState('物料')
    return (
        <div className='h-full flex flex-col'>
            <div className='flex-shrink-0 p-4 border-b border-border-light bg-bg-secondary'>
                <Segmented 
                    value={key} 
                    options={['物料', '大纲', '源码', '智能']} 
                    block 
                    onChange={setKey}
                    className='shadow-soft'
                />
            </div>
            <div className='flex-1 overflow-y-auto p-4 scrollbar-thin'>
                {key === '物料' && <Material />}
                {key === '大纲' && <Outline />}
                {key === '源码' && <Source />}
                {key === '智能' && <IntelligencePanel />}
            </div>
        </div>
    )
}
