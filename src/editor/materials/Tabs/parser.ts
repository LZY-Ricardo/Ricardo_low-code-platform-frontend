export interface ParsedTabItem {
  key: string
  label: string
  children: string
}

export function parseTabsItems(input: string): ParsedTabItem[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label, index) => ({
      key: `tab_${index}`,
      label,
      children: `${label}内容`,
    }))
}
