import { create } from 'zustand'

export interface ThemeTokens {
  bgPrimary: string
  bgSecondary: string
  borderLight: string
  textPrimary: string
  textSecondary: string
  colorPrimary: string
  colorPrimaryHover: string
}

export interface EditorTheme {
  id: string
  name: string
  tokens: ThemeTokens
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

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  currentThemeId: THEME_PRESETS[0].id,
  customThemes: [],

  setTheme: (themeId) => set({ currentThemeId: themeId }),

  hydrateTheme: (themeId) => set({ currentThemeId: themeId ?? THEME_PRESETS[0].id }),

  getActiveTheme: () => {
    const themes = [...THEME_PRESETS, ...get().customThemes]
    return themes.find((item) => item.id === get().currentThemeId) ?? THEME_PRESETS[0]
  },
}))
