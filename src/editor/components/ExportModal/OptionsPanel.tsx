import { Input, Checkbox, Form } from 'antd'
import { ExportFormat, type ExportOptions } from '@/editor/utils/exporters'

interface OptionsPanelProps {
  format: ExportFormat
  options: ExportOptions
  onChange: (options: Partial<ExportOptions>) => void
}

/**
 * 导出配置选项面板
 */
export default function OptionsPanel({ format, options, onChange }: OptionsPanelProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 500 }}>
        配置选项
      </div>

      <Form layout="vertical">
        {/* 通用选项：项目名称 */}
        <Form.Item label="项目名称">
          <Input
            value={options.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="请输入项目名称"
          />
        </Form.Item>

        {/* JSON 特有选项 */}
        {format === ExportFormat.JSON && (
          <>
            <Form.Item>
              <Checkbox
                checked={options.includeComments !== false}
                onChange={(e) => onChange({ includeComments: e.target.checked })}
              >
                包含注释
              </Checkbox>
            </Form.Item>
          </>
        )}

        {/* HTML 特有选项 */}
        {format === ExportFormat.HTML && (
          <>
            <Form.Item>
              <Checkbox
                checked={options.includeAntdCDN !== false}
                onChange={(e) => onChange({ includeAntdCDN: e.target.checked })}
              >
                引入 Ant Design CDN
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={options.minifyHTML === true}
                onChange={(e) => onChange({ minifyHTML: e.target.checked })}
              >
                压缩 HTML（移除空格和换行）
              </Checkbox>
            </Form.Item>
          </>
        )}

        {/* 提示信息 */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--scrollbar-track)',
            borderRadius: 6,
            fontSize: 13,
            color: 'rgb(var(--text-secondary))'
          }}
        >
          {getFormatTip(format)}
        </div>
      </Form>
    </div>
  )
}

/**
 * 获取格式提示信息
 */
function getFormatTip(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.JSON:
      return '💡 导出的 JSON 文件可用于备份项目配置，或与团队成员共享。'

    case ExportFormat.HTML:
      return '💡 导出的 HTML 文件可直接在浏览器中打开，无需任何运行环境。适合快速演示。'

    case ExportFormat.REACT:
      return '💡 导出的 React 项目包含完整的源码，可以直接运行 npm install && npm run dev。'

    case ExportFormat.VUE:
      return '💡 导出的 Vue 项目包含完整的源码，可以直接运行 npm install && npm run dev。'

    case ExportFormat.SNIPPET:
      return '💡 导出的代码片段可以直接复制到现有项目中使用。'

    default:
      return ''
  }
}
