import { useComponentsStore } from '../../stores/components'
import { DownOutlined } from '@ant-design/icons';
import { message, Tree } from 'antd';
import type { TreeProps } from 'antd'
import { useComponentConfigStore } from '../../stores/component-config'
import { getOutlineDropTarget } from '../../utils/outline-drop'

// 1. Tree 组件展示
// 2. json 在仓库中
export default function Outline() {
    const { components, curComponentId, moveComponent, setCurComponentId } = useComponentsStore((state) => state)
    const { componentConfig } = useComponentConfigStore()
    const treeData = components as unknown as NonNullable<TreeProps['treeData']>
    const [messageApi, contextHolder] = message.useMessage()

    const handleDrop: TreeProps['onDrop'] = (info) => {
        const dragId = Number(info.dragNode.key)
        const dropId = Number(info.node.key)

        if (!dragId || !dropId || dragId === 1) {
            return
        }

        const target = getOutlineDropTarget({
            components,
            componentConfig,
            dragId,
            dropId,
            dropToGap: info.dropToGap,
            dropPosition: info.dropPosition,
            dropPos: info.node.pos,
        })

        if (!target) {
            messageApi.warning('目标组件不支持放置子节点')
            return
        }

        moveComponent(dragId, target.targetParentId, target.targetIndex)
    }

    return (
        <div className='text-text-primary'>
            {contextHolder}
            <Tree
                defaultExpandAll
                draggable={{ icon: false }}
                switcherIcon={<DownOutlined />}
                showLine
                fieldNames={{title: 'desc', key: 'id'}}
                treeData={treeData}
                selectedKeys={curComponentId ? [curComponentId] : []}
                onSelect={([selectedKey], info) => {
                    console.log(selectedKey, info)
                    setCurComponentId(selectedKey ? Number(selectedKey) : null)
                }}
                onDrop={handleDrop}
                className='text-sm'
            />
        </div>
    )
}
