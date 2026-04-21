import { describe, expect, it } from 'vitest'
import { generateComponentsFromPrompt } from './ai-generator'

describe('ai generator', () => {
  it('generates dashboard skeleton for dashboard prompts', () => {
    const components = generateComponentsFromPrompt('生成一个运营数据看板')
    expect(components[0].name).toBe('Page')
    expect(components[0].children?.some((item) => item.name === 'Chart')).toBe(true)
    expect(components[0].children?.every((item) => item.parentId === 1)).toBe(true)
  })

  it('generates form skeleton for form prompts', () => {
    const components = generateComponentsFromPrompt('生成一个报名表单')
    expect(components[0].children?.some((item) => item.name === 'Form')).toBe(true)
  })
})
