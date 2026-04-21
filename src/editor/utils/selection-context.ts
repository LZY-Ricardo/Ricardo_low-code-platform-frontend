import { getComponentById } from '../stores/components';
import type { Component } from '../stores/components';

export interface SelectionContext {
  selected: Component | null;
  parent: Component | null;
  siblings: Component[];
  ancestors: Component[];
  summary: string;
}

export function buildSelectionContext(
  components: Component[],
  selectedComponentId: number | null | undefined,
): SelectionContext {
  const selected = getComponentById(
    selectedComponentId ?? null,
    components,
  ) as Component | null;

  if (!selected) {
    return {
      selected: null,
      parent: null,
      siblings: [],
      ancestors: [],
      summary: '当前未选中任何区块。',
    };
  }

  const parent = getComponentById(selected.parentId ?? null, components) as
    | Component
    | null;
  const siblings = (parent?.children ?? []).filter((item) => item.id !== selected.id) as Component[];
  const ancestors = collectAncestors(components, selected.parentId);

  return {
    selected,
    parent,
    siblings,
    ancestors,
    summary: [
      `当前选中：${selected.name}（${selected.desc}）`,
      parent ? `父级：${parent.name}` : '父级：无',
      siblings.length
        ? `兄弟：${siblings.map((item) => item.name).join('、')}`
        : '兄弟：无',
      ancestors.length
        ? `祖先链：${ancestors.map((item) => item.name).join(' > ')}`
        : '祖先链：无',
    ].join('；'),
  };
}

function collectAncestors(
  components: Component[],
  parentId: number | undefined,
): Component[] {
  const ancestors: Component[] = [];
  let currentParentId = parentId;

  while (currentParentId) {
    const parent = getComponentById(currentParentId, components) as Component | null;
    if (!parent) {
      break;
    }
    ancestors.unshift(parent);
    currentParentId = parent.parentId;
  }

  return ancestors;
}
