import { create } from 'zustand'

export interface ThemeTokens {
  bgPrimary: string
  bgSecondary: string
  borderLight: string
  textPrimary: string
  textSecondary: string
  colorPrimary: string
  colorPrimaryHover: string
  colorSuccess: string
  colorDanger: string
  scrollbarThumb: string
  scrollbarTrack: string
}

export interface EditorTheme {
  id: string
  name: string
  tokens: ThemeTokens
}

function rgbTripletToRgba(value: string, alpha: number): string {
  const [r, g, b] = value.split(' ').map(Number)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getThemeCssVariables(theme: EditorTheme): Record<string, string> {
  const { tokens } = theme
  return {
    '--bg-primary': tokens.bgPrimary,
    '--bg-secondary': tokens.bgSecondary,
    '--border-light': tokens.borderLight,
    '--text-primary': tokens.textPrimary,
    '--text-secondary': tokens.textSecondary,
    '--color-primary': tokens.colorPrimary,
    '--color-primary-hover': tokens.colorPrimaryHover,
    '--color-success': tokens.colorSuccess,
    '--color-danger': tokens.colorDanger,
    '--scrollbar-thumb': tokens.scrollbarThumb,
    '--scrollbar-track': tokens.scrollbarTrack,
    '--theme-primary-soft': rgbTripletToRgba(tokens.colorPrimary, 0.08),
    '--theme-primary-muted': rgbTripletToRgba(tokens.colorPrimary, 0.14),
    '--theme-primary-strong': rgbTripletToRgba(tokens.colorPrimary, 0.22),
    '--theme-success-soft': rgbTripletToRgba(tokens.colorSuccess, 0.14),
    '--theme-danger-soft': rgbTripletToRgba(tokens.colorDanger, 0.14),
    '--surface-muted': `linear-gradient(180deg, rgb(${tokens.bgSecondary}) 0%, rgba(${tokens.bgPrimary}, 0.92) 100%)`,
    '--surface-page': `linear-gradient(180deg, ${rgbTripletToRgba(tokens.colorPrimary, 0.12)} 0%, rgba(${tokens.bgPrimary}, 0.96) 22%, rgb(${tokens.bgPrimary}) 100%)`,
    '--surface-hero': `linear-gradient(180deg, ${rgbTripletToRgba(tokens.colorPrimary, 0.14)} 0%, rgba(255, 255, 255, 0.95) 42%, rgba(255, 255, 255, 0.98) 100%)`,
  }
}

export const THEME_PRESETS: EditorTheme[] = [
  {
    id: 'ocean',
    name: '海岸蓝',
    tokens: {
      bgPrimary: '248 249 250',
      bgSecondary: '255 255 255',
      borderLight: '229 231 235',
      textPrimary: '31 41 55',
      textSecondary: '107 114 128',
      colorPrimary: '59 130 246',
      colorPrimaryHover: '37 99 235',
      colorSuccess: '16 185 129',
      colorDanger: '239 68 68',
      scrollbarThumb: '#cbd5e1',
      scrollbarTrack: '#f1f5f9',
    },
  },
  {
    id: 'sunset',
    name: '落日橙',
    tokens: {
      bgPrimary: '255 247 237',
      bgSecondary: '255 255 255',
      borderLight: '254 215 170',
      textPrimary: '67 20 7',
      textSecondary: '154 52 18',
      colorPrimary: '234 88 12',
      colorPrimaryHover: '194 65 12',
      colorSuccess: '22 163 74',
      colorDanger: '220 38 38',
      scrollbarThumb: '#d4c5b5',
      scrollbarTrack: '#f7f0e8',
    },
  },
  {
    id: 'forest',
    name: '森林绿',
    tokens: {
      bgPrimary: '240 253 244',
      bgSecondary: '255 255 255',
      borderLight: '187 247 208',
      textPrimary: '20 83 45',
      textSecondary: '22 101 52',
      colorPrimary: '22 163 74',
      colorPrimaryHover: '21 128 61',
      colorSuccess: '34 197 94',
      colorDanger: '239 68 68',
      scrollbarThumb: '#b5cfc0',
      scrollbarTrack: '#eef7f0',
    },
  },
]

interface ThemeState {
  currentThemeId: string
  customThemes: EditorTheme[]
}

interface ThemeActions {
  setTheme: (themeId: string) => void
  hydrateTheme: (themeId: string | null) => void
  getActiveTheme: () => EditorTheme
}

const THEME_STORAGE_KEY = 'lowcode_theme_id'

/**
 * 检查用户是否曾经主动设置过主题（localStorage 中有明确记录）
 * 区分"从未选过"和"选了默认值"
 */
function hasUserPreference(): boolean {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) !== null
  } catch { return false }
}

function loadPersistedThemeId(): string {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && THEME_PRESETS.some((t) => t.id === stored)) {
      return stored
    }
  } catch { /* ignore */ }
  return THEME_PRESETS[0].id
}

function persistThemeId(themeId: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  } catch { /* ignore */ }
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  currentThemeId: loadPersistedThemeId(),
  customThemes: [],

  setTheme: (themeId) => {
    persistThemeId(themeId)
    set({ currentThemeId: themeId })
  },

  /**
   * 从项目数据恢复主题
   * - 如果用户曾主动设置过主题（全局偏好），始终使用全局偏好
   * - 否则使用项目自身保存的 themeId（首次使用、模板场景）
   */
  hydrateTheme: (themeId) => {
    const resolved = hasUserPreference()
      ? loadPersistedThemeId()
      : (themeId ?? THEME_PRESETS[0].id)
    persistThemeId(resolved)
    set({ currentThemeId: resolved })
  },

  getActiveTheme: () => {
    const themes = [...THEME_PRESETS, ...get().customThemes]
    return themes.find((item) => item.id === get().currentThemeId) ?? THEME_PRESETS[0]
  },
}))

/** 主题颜色快捷 hook，用于内联样式场景 */
export function useThemeColors() {
  const tokens = useThemeStore((s) => s.getActiveTheme().tokens)
  const [r, g, b] = tokens.colorPrimary.split(' ').map(Number)
  return {
    primary: `rgb(${tokens.colorPrimary})`,
    primaryHover: `rgb(${tokens.colorPrimaryHover})`,
    primaryAlpha: (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`,
    success: `rgb(${tokens.colorSuccess})`,
    danger: `rgb(${tokens.colorDanger})`,
    primaryHex: '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''),
    primaryHoverHex: '#' + tokens.colorPrimaryHover.split(' ').map((v) => Number(v).toString(16).padStart(2, '0')).join(''),
  }
}
