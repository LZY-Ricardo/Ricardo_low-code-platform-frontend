import { useState } from 'react'
import { Segmented } from 'antd';
import Material from '../Materail'
import Outline from '../Outline'
import Source from '../Source'
import IntelligencePanel from '../IntelligencePanel'
import AssetPanel from '../AssetPanel';
import { useProjectStore } from '../../stores/project';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function MaterialWrapper() {
    const [key, setKey] = useState('物料')
    const { currentProject } = useProjectStore()
    const navigate = useNavigate()
    return (
        <div className='h-full flex flex-col'>
            <div className='flex-shrink-0 p-4 border-b border-border-light bg-bg-secondary'>
                <Segmented 
                    value={key} 
                    options={['物料', '资源', '市场', '大纲', '源码', '智能']}
                    block 
                    onChange={setKey}
                    className='shadow-soft'
                />
            </div>
            <div className='flex-1 overflow-y-auto p-4 scrollbar-thin'>
                {key === '物料' && <Material />}
                {key === '资源' && <AssetPanel projectId={currentProject?.id} />}
                {key === '市场' && (
                  <div className='flex h-full flex-col items-center justify-center gap-4 text-center'>
                    <div className='text-sm text-text-secondary'>浏览社区组件与模板，并将组件安装到当前编辑器。</div>
                    <Button type='primary' onClick={() => navigate('/market')}>
                      打开创作者市场
                    </Button>
                  </div>
                )}
                {key === '大纲' && <Outline />}
                {key === '源码' && <Source />}
                {key === '智能' && <IntelligencePanel />}
            </div>
        </div>
    )
}
