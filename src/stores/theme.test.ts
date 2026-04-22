import { beforeEach, describe, expect, it } from 'vitest'
import { THEME_PRESETS, getThemeCssVariables, useThemeStore } from './theme'

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

  it('builds semantic runtime css variables for themed surfaces', () => {
    const theme = THEME_PRESETS[1]
    const variables = getThemeCssVariables(theme)

    expect(variables['--bg-primary']).toBe(theme.tokens.bgPrimary)
    expect(variables['--color-primary']).toBe(theme.tokens.colorPrimary)
    expect(variables['--theme-primary-soft']).toContain('rgba(')
    expect(variables['--surface-muted']).toContain('linear-gradient')
    expect(variables['--surface-page']).toContain('linear-gradient')
  })
})
