import type { ActionSuggestion, BindDataSuggestion } from '../api/ai';
import type { Component } from '../stores/components';
import type { DataSource } from '../stores/data-source';

export function validateBindDataSuggestion(
  suggestion: BindDataSuggestion,
  components: Component[],
  dataSources: DataSource[],
): { valid: boolean; reason?: string } {
  const componentExists = findComponentById(components, suggestion.componentId);
  if (!componentExists) {
    return { valid: false, reason: '目标组件不存在' };
  }

  if (suggestion.dataSourceId) {
    const dataSourceExists = dataSources.some((item) => item.id === suggestion.dataSourceId);
    if (!dataSourceExists) {
      return { valid: false, reason: '目标数据源不存在' };
    }
  }

  return { valid: true };
}

export function validateActionSuggestion(
  suggestion: ActionSuggestion,
  components: Component[],
  dataSources: DataSource[],
): { valid: boolean; reason?: string } {
  const triggerComponent = findComponentById(components, suggestion.componentId);
  if (!triggerComponent) {
    return { valid: false, reason: '触发组件不存在' };
  }

  if (suggestion.actionType === 'callAPI') {
    const dataSourceId = typeof suggestion.actionConfig.dataSourceId === 'string'
      ? suggestion.actionConfig.dataSourceId
      : '';
    if (!dataSourceId || !dataSources.some((item) => item.id === dataSourceId)) {
      return { valid: false, reason: '动作依赖的数据源不存在' };
    }
  }

  if (suggestion.actionType === 'setState') {
    const componentId = typeof suggestion.actionConfig.componentId === 'number'
      ? suggestion.actionConfig.componentId
      : null;
    if (!componentId || !findComponentById(components, componentId)) {
      return { valid: false, reason: '状态目标组件不存在' };
    }
  }

  return { valid: true };
}

function findComponentById(
  components: Component[],
  componentId: number,
): Component | null {
  for (const component of components) {
    if (component.id === componentId) {
      return component;
    }

    if (component.children?.length) {
      const child = findComponentById(component.children as Component[], componentId);
      if (child) {
        return child;
      }
    }
  }

  return null;
}
