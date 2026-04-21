import type { Component } from '../stores/components'
import type { ComponentConfigMap } from '../stores/component-config'

export function createComponentInstance(
  componentConfig: ComponentConfigMap,
  name: string,
  id: number,
): Component {
  const config = componentConfig[name]
  if (!config) {
    throw new Error(`未找到组件配置: ${name}`)
  }

  return {
    id,
    name,
    desc: config.desc,
    props: { ...config.defaultProps },
    styles: {},
  }
}
