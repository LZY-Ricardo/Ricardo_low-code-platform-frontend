export type ChartType = 'bar' | 'line' | 'pie'

export interface ChartDatum {
  name: string
  value: number
}

export function parseChartData(input: string): ChartDatum[] {
  return input
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(',').map((item) => item.trim()))
    .filter(([name, value]) => Boolean(name) && Boolean(value) && !Number.isNaN(Number(value)))
    .map(([name, value]) => ({
      name,
      value: Number(value),
    }))
}

export function normalizeChartType(value: unknown): ChartType {
  if (value === 'bar' || value === 'line' || value === 'pie') {
    return value
  }

  return 'bar'
}
