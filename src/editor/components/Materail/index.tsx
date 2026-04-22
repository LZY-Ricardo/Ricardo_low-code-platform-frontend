import { useMemo, useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined, ShopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useComponentConfigStore } from '../../stores/component-config'
import MaterialItem from '../MaterialItem'
import CreateCustomComponentModal from '../CustomComponent/CreateCustomComponentModal'

export default function Materail() {
  const componentConfig = useComponentConfigStore((state) => state.componentConfig)
  const navigate = useNavigate()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { builtInComponents, marketComponents, customComponents } = useMemo(() => {
    const all = Object.values(componentConfig).filter(item => item.name !== 'Page')
    return {
      builtInComponents: all.filter(item => !item.name.startsWith('Custom_') && !item.name.startsWith('Market_')),
      marketComponents: all.filter(item => item.name.startsWith('Market_')),
      customComponents: all.filter(item => item.name.startsWith('Custom_')),
    }
  }, [componentConfig])

  return (
    <div>
      <div className='group mb-3 flex items-center justify-between gap-2'>
        <div className='text-sm font-medium text-text-primary'>物料库</div>
        <Button
          type='link'
          size='small'
          icon={<ShopOutlined />}
          className='px-0 text-xs text-text-quaternary opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100'
          onClick={() => navigate('/market')}
        >
          市场入口
        </Button>
      </div>
      {
        builtInComponents.map((item, index) => {
          return <MaterialItem key={item.name + index} name={item.name} tooltip={item.tooltip} />
        })
      }

      {customComponents.length > 0 && (
        <>
          <div className='my-3 flex items-center justify-between border-t border-border-light pt-3'>
            <div className='text-xs font-medium text-text-secondary/70'>自定义组件</div>
            <Button
              type='text'
              size='small'
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            />
          </div>
          {customComponents.map((item, index) => (
            <MaterialItem key={item.name + index} name={item.name} tooltip={item.tooltip} />
          ))}
        </>
      )}

      {marketComponents.length > 0 && (
        <>
          <div className='my-3 border-t border-border-light pt-3'>
            <div className='text-xs font-medium text-text-secondary/70'>市场组件</div>
          </div>
          {marketComponents.map((item, index) => (
            <MaterialItem key={item.name + index} name={item.name} tooltip={item.tooltip} />
          ))}
        </>
      )}

      {customComponents.length === 0 && marketComponents.length === 0 && (
        <div className='mt-3 border-t border-border-light pt-3'>
          <Button
            type='dashed'
            size='small'
            block
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            创建自定义组件
          </Button>
        </div>
      )}

      <CreateCustomComponentModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => setCreateModalOpen(false)}
      />
    </div>
  )
}
