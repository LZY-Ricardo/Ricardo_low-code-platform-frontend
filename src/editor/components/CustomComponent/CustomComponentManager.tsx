import { useState } from 'react'
import { App, Button, Input, Modal, Popconfirm, Space, Table, Tooltip } from 'antd'
import { CopyOutlined, DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useCustomComponentStore } from '../../stores/custom-component'
import { createMarketComponent } from '../../../api/market'
import CreateCustomComponentModal from './CreateCustomComponentModal'
import {
  filterManagedComponents,
  getComponentManagerEmptyText,
  getComponentManagerTitle,
  type ComponentManagerSource,
} from './component-manager-utils'

interface CustomComponentManagerProps {
  open: boolean
  onClose: () => void
  source: ComponentManagerSource
}

export default function CustomComponentManager({ open, onClose, source }: CustomComponentManagerProps) {
  const { message } = App.useApp()
  const store = useCustomComponentStore()
  const components = store.components
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const filtered = filterManagedComponents(components, source, search)
  const isUserManager = source === 'user'

  const handleEdit = (id: string) => {
    setEditId(id)
    setCreateModalOpen(true)
  }

  const handleDelete = (id: string) => {
    store.remove(id)
    message.success('组件已删除')
  }

  const handleDuplicate = (id: string) => {
    store.duplicate(id)
    message.success('组件已复制')
  }

  const handleExport = async (id: string) => {
    const def = store.getById(id)
    if (!def) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(def, null, 2))
      message.success('已复制到剪贴板')
    } catch {
      message.error('复制失败，请检查浏览器权限')
    }
  }

  const handlePublishToMarket = async (id: string) => {
    const def = store.getById(id)
    if (!def) return
    try {
      setPublishingId(id)
      await createMarketComponent({
        name: def.name,
        displayName: def.displayName,
        description: def.description,
        category: 'custom',
        icon: null,
        thumbnail: null,
        code: def.code,
        defaultProps: def.defaultProps,
        setterConfig: def.setterConfig,
        version: '1.0.0',
        isPublic: true,
      })
      message.success('已发布到市场')
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      } else {
        message.error('发布失败')
      }
    } finally {
      setPublishingId(null)
    }
  }

  const handleModalClose = () => {
    setCreateModalOpen(false)
    setEditId(null)
  }

  return (
    <>
      <Modal
        title={getComponentManagerTitle(source)}
        open={open}
        onCancel={onClose}
        footer={null}
        width={880}
        destroyOnClose
      >
        <div className="mb-4 flex items-center justify-between">
          <Input.Search
            placeholder="搜索组件"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          {isUserManager ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditId(null)
                setCreateModalOpen(true)
              }}
            >
              新建组件
            </Button>
          ) : null}
        </div>

        <Table
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            {
              title: '名称',
              dataIndex: 'displayName',
              key: 'displayName',
              width: 220,
              render: (text: string, record) => (
                <div>
                  <div className="font-medium">{text}</div>
                  <div className="text-xs text-text-secondary/70">{record.name}</div>
                </div>
              ),
            },
            {
              title: '描述',
              dataIndex: 'description',
              key: 'description',
              ellipsis: true,
            },
            {
              title: '操作',
              key: 'actions',
              width: 200,
              render: (_: unknown, record) => (
                <Space size="small">
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record.id)}
                    />
                  </Tooltip>
                  <Tooltip title="复制">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleDuplicate(record.id)}
                    />
                  </Tooltip>
                  <Tooltip title="导出 JSON">
                    <Button
                      type="text"
                      size="small"
                      icon={<ExportOutlined />}
                      onClick={() => handleExport(record.id)}
                    />
                  </Tooltip>
                  {isUserManager ? (
                    <Tooltip title="发布到市场">
                      <Button
                        type="text"
                        size="small"
                        icon={<UploadOutlined />}
                        loading={publishingId === record.id}
                        onClick={() => handlePublishToMarket(record.id)}
                      />
                    </Tooltip>
                  ) : null}
                  <Popconfirm
                    title="确定删除该组件？"
                    description="项目中使用该组件的地方将无法正常渲染"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Tooltip title="删除">
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          locale={{ emptyText: getComponentManagerEmptyText(source) }}
        />
      </Modal>

      <CreateCustomComponentModal
        open={createModalOpen}
        onCancel={handleModalClose}
        onSuccess={handleModalClose}
        editId={editId}
      />
    </>
  )
}
