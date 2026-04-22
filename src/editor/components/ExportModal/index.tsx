import { useState, useEffect } from 'react'
import { Modal, Button, message } from 'antd'
import { ExportFormat, ExporterFactory, type ExportOptions } from '@/editor/utils/exporters'
import { useComponentsStore } from '@/editor/stores/components'
import { useProjectStore } from '@/editor/stores/project'
import { useThemeColors } from '@/stores/theme'
import FormatSelector from './FormatSelector'
import OptionsPanel from './OptionsPanel'

interface ExportModalProps {
  visible: boolean
  onClose: () => void
}

/**
 * 导出弹窗组件
 */
export default function ExportModal({ visible, onClose }: ExportModalProps) {
  const components = useComponentsStore((state) => state.components)
  const currentProject = useProjectStore((state) => state.currentProject)
  const themeColors = useThemeColors()

  // 导出格式
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.JSON)

  // 导出选项
  const [options, setOptions] = useState<ExportOptions>({
    projectName: currentProject?.name || 'lowcode-project',
    format: ExportFormat.JSON,
    includeComments: true,
    indentSize: 2,
    indentType: 'space',
    includeAntdCDN: true,
    minifyHTML: false
  })

  // 加载状态
  const [loading, setLoading] = useState(false)

  // 当弹窗打开或当前项目变化时，同步更新项目名称
  useEffect(() => {
    if (visible && currentProject) {
      setOptions(prev => ({
        ...prev,
        projectName: currentProject.name
      }))
    }
  }, [visible, currentProject])

  // 更新选项
  const handleOptionsChange = (newOptions: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }))
  }

  // 格式变化时更新选项
  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat)
    setOptions((prev) => ({ ...prev, format: newFormat }))
  }

  // 导出
  const handleExport = async () => {
    // 验证项目名称
    if (!options.projectName || !options.projectName.trim()) {
      message.error('请输入项目名称')
      return
    }

    setLoading(true)

    try {
      // 创建导出器
      const exporter = ExporterFactory.create(format)

      // 执行导出
      const result = await exporter.export(components, {
        ...options,
        themeColors: {
          primary: themeColors.primaryHex,
          primaryHover: themeColors.primaryHoverHex,
        }
      })

      if (result.success) {
        message.success(result.message || '导出成功')
        onClose()
      } else {
        message.error(result.message || '导出失败')
      }
    } catch (error) {
      console.error('导出失败:', error)
      message.error((error as Error).message || '导出失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 重置状态
  const handleClose = () => {
    if (!loading) {
      onClose()
      // 延迟重置状态，避免关闭动画期间看到状态变化
      setTimeout(() => {
        setFormat(ExportFormat.JSON)
        setOptions({
          projectName: currentProject?.name || 'lowcode-project',
          format: ExportFormat.JSON,
          includeComments: true,
          indentSize: 2,
          indentType: 'space',
          includeAntdCDN: true,
          minifyHTML: false
        })
      }, 300)
    }
  }

  return (
    <Modal
      title="导出项目"
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          取消
        </Button>,
        <Button
          key="export"
          type="primary"
          loading={loading}
          onClick={handleExport}
        >
          {loading ? '导出中...' : '导出'}
        </Button>
      ]}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
        {/* 格式选择器 */}
        <FormatSelector value={format} onChange={handleFormatChange} />

        {/* 配置选项 */}
        <OptionsPanel
          format={format}
          options={options}
          onChange={handleOptionsChange}
        />
      </div>
    </Modal>
  )
}
