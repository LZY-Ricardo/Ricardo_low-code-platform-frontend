import type { CommonComponentProps } from '../../interface'
import { normalizeChartType, parseChartData, type ChartDatum } from './parser'
import { useThemeColors } from '../../../stores/theme'
import { useMemo } from 'react'

function BarChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <div className="w-20 text-sm text-text-secondary">{item.name}</div>
          <div className="h-8 flex-1 rounded bg-bg-primary overflow-hidden">
            <div
              className="h-full rounded bg-accent"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm text-text-primary">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((item) => (
        <div key={item.name} className="flex flex-1 flex-col items-center gap-2">
          <div className="text-xs text-text-primary">{item.value}</div>
          <div className="flex h-36 w-full items-end rounded bg-bg-primary px-2 pb-2">
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary">{item.name}</div>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  const themeColors = useThemeColors()

  const colors = useMemo(() => {
    const base = themeColors.primary
    // 生成基于主题色的渐变色板
    return [
      base,
      themeColors.success,
      '#faad14',
      '#722ed1',
      '#ff4d4f',
    ]
  }, [themeColors.primary, themeColors.success])

  return (
    <div className="flex flex-col gap-3">
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <div className="flex-1 text-sm text-text-primary">{item.name}</div>
          <div className="text-sm text-text-secondary">{Math.round((item.value / total) * 100)}%</div>
        </div>
      ))}
    </div>
  )
}

export default function Chart({ id, title, chartType, dataText, dataSource, styles }: CommonComponentProps) {
  const data = Array.isArray(dataSource)
    ? dataSource
    : parseChartData(typeof dataText === 'string' ? dataText : '')
  const type = normalizeChartType(chartType)

  return (
    <div
      data-component-id={id}
      style={styles}
      className="rounded-xl border border-border-light bg-bg-secondary p-4 shadow-soft"
    >
      <div className="mb-4 text-sm font-semibold text-text-primary">
        {typeof title === 'string' && title ? title : '数据图表'}
      </div>
      {type === 'bar' && <BarChart data={data} />}
      {type === 'line' && <LineChart data={data} />}
      {type === 'pie' && <PieChart data={data} />}
    </div>
  )
}
