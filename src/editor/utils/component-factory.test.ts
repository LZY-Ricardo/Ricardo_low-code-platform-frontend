import { describe, expect, it } from 'vitest'
import type { ComponentConfigMap } from '../stores/component-config'
import { createComponentInstance } from './component-factory'

describe('component factory', () => {
  const componentConfig = {
    Button: {
      name: 'Button',
      desc: '按钮',
      defaultProps: {
        type: 'primary',
        text: '按钮',
      },
      dev: (() => null) as never,
      prod: (() => null) as never,
    },
    Container: {
      name: 'Container',
      desc: '容器',
      defaultProps: {},
      dev: (() => null) as never,
      prod: (() => null) as never,
    },
  } as ComponentConfigMap

  it('creates a component instance from config defaults', () => {
    const component = createComponentInstance(componentConfig, 'Button', 11)

    expect(component).toMatchObject({
      id: 11,
      name: 'Button',
      desc: '按钮',
      props: {
        type: 'primary',
        text: '按钮',
      },
      styles: {},
    })
  })

  it('throws when component config is missing', () => {
    expect(() => createComponentInstance(componentConfig, 'Missing', 1)).toThrow('未找到组件配置')
  })
})
