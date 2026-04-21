const MIN_SCALE = 0.5
const MAX_SCALE = 2
const STEP = 0.1

export function clampCanvasScale(scale: number): number {
  return Number(Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE).toFixed(2))
}

export function stepCanvasScale(scale: number, direction: 'in' | 'out'): number {
  const delta = direction === 'in' ? STEP : -STEP
  return clampCanvasScale(scale + delta)
}

export function getNextCanvasScaleLabel(scale: number): string {
  return `${Math.round(clampCanvasScale(scale) * 100)}%`
}
