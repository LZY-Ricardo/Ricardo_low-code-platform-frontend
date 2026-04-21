import type { CSSProperties } from 'react';
import { getComponentById, updateComponentInTree } from './component-tree';
import type { Component } from '../stores/components';

export interface ReplacePatchNode {
  id: number;
  name: string;
  props: Record<string, unknown>;
  desc: string;
  parentId?: number;
  bindings?: Record<string, string>;
  sharedStyleId?: string;
  styles?: CSSProperties;
  events?: Record<string, unknown>;
  children?: ReplacePatchNode[];
}

export function applyReplacePatch(
  components: Component[],
  targetComponentId: number,
  patch: ReplacePatchNode,
): Component[] {
  const target = getComponentById(targetComponentId, components) as Component | null;
  if (!target) {
    return components;
  }

  const nextId = createIdFactory(components);
  const normalized = normalizePatchNode(
    patch,
    target.id,
    target.parentId,
    nextId,
  );

  return updateComponentInTree(components, targetComponentId, () => normalized) as Component[];
}

function normalizePatchNode(
  node: ReplacePatchNode,
  id: number,
  parentId: number | undefined,
  nextId: () => number,
): Component {
  return {
    id,
    name: node.name,
    props: { ...node.props },
    desc: node.desc,
    parentId,
    bindings: node.bindings ? { ...node.bindings } : undefined,
    sharedStyleId: node.sharedStyleId,
    styles: node.styles ? { ...node.styles } : undefined,
    events: node.events as Component['events'],
    children: node.children?.map((child) =>
      normalizePatchNode(child, nextId(), id, nextId),
    ),
  };
}

function createIdFactory(components: Component[]): () => number {
  let current = findMaxId(components);
  return () => {
    current += 1;
    return current;
  };
}

function findMaxId(components: Component[]): number {
  return components.reduce((maxId, component) => {
    const childMax = component.children?.length
      ? findMaxId(component.children as Component[])
      : 0;
    return Math.max(maxId, component.id, childMax);
  }, 0);
}
