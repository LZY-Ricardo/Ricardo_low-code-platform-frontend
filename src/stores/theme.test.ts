import { beforeEach, describe, expect, it } from 'vitest'
import { THEME_PRESETS, useThemeStore } from './theme'

beforeEach(() => {
  useThemeStore.setState({
    currentThemeId: 'ocean',
    customThemes: [],
  })
})

describe('theme store', () => {
  it('switches between built-in themes', () => {
    useThemeStore.getState().setTheme('sunset')
    expect(useThemeStore.getState().currentThemeId).toBe('sunset')
  })

  it('exposes active theme tokens', () => {
    const theme = THEME_PRESETS[0]
    useThemeStore.getState().setTheme(theme.id)
    expect(useThemeStore.getState().getActiveTheme().tokens.colorPrimary).toBe(theme.tokens.colorPrimary)
  })
})
