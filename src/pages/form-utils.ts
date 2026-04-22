import type { FormField } from '../api/forms';
import type { Component } from '../editor/stores/components';
import { updateComponentInTree } from '../editor/utils/component-tree';
import { deserializeProjectSnapshot, serializeProjectSnapshot } from '../editor/utils/project-snapshot';

export function buildTrendBars(trend: Array<{ date: string; count: number }>) {
  const max = Math.max(...trend.map((item) => item.count), 1);
  return trend.map((item) => ({
    ...item,
    percent: Math.max(8, Math.round((item.count / max) * 100)),
  }));
}

export function inferFormFieldsFromComponents(components: Array<any>): FormField[] {
  const collected: FormField[] = [];

  const walk = (nodes: Array<any>) => {
    nodes.forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      if (node.name === 'Input') {
        collected.push({
          key: `field_${node.id}`,
          label: typeof node.props?.placeholder === 'string' && node.props.placeholder
            ? node.props.placeholder
            : `输入项 ${node.id}`,
          type: 'text',
          required: false,
          placeholder: node.props?.placeholder,
        });
      }

      if (node.name === 'Select') {
        collected.push({
          key: `field_${node.id}`,
          label: typeof node.props?.placeholder === 'string' && node.props.placeholder
            ? node.props.placeholder
            : `选择项 ${node.id}`,
          type: 'select',
          required: false,
          placeholder: node.props?.placeholder,
          options:
            typeof node.props?.optionsText === 'string'
              ? node.props.optionsText.split(',').map((item: string) => item.trim()).filter(Boolean)
              : [],
        });
      }

      if (node.name === 'DatePicker') {
        collected.push({
          key: `field_${node.id}`,
          label: typeof node.props?.placeholder === 'string' && node.props.placeholder
            ? node.props.placeholder
            : `日期项 ${node.id}`,
          type: 'date',
          required: false,
          placeholder: node.props?.placeholder,
        });
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    });
  };

  walk(components);
  return collected;
}

type ProjectFormCandidate = {
  id: number;
  children: Component[];
  formId?: string;
};

export type ProjectFormBindingReason =
  | 'auto-bind-ready'
  | 'no-form-component'
  | 'multiple-unbound-forms'
  | 'all-forms-already-bound';

export interface ProjectFormAnalysis {
  fields: FormField[];
  targetComponentId: number | null;
  reason: ProjectFormBindingReason;
  totalForms: number;
  unboundForms: number;
}

export function analyzeProjectFormBinding(
  projectComponents: Component[],
  options?: {
    preferredComponentId?: number | null;
  },
): ProjectFormAnalysis {
  const snapshot = deserializeProjectSnapshot(projectComponents);
  const pageComponents = snapshot?.pages.flatMap((page) => page.components) ?? projectComponents;
  const forms = collectFormCandidates(pageComponents);
  const unboundForms = forms.filter((item) => !item.formId);
  const preferredComponentId = options?.preferredComponentId ?? null;
  const preferredTarget = preferredComponentId
    ? unboundForms.find((item) => item.id === preferredComponentId) ?? null
    : null;
  const target = preferredTarget ?? (unboundForms.length === 1 ? unboundForms[0] : null);

  if (target) {
    return {
      fields: inferFormFieldsFromComponents(target.children),
      targetComponentId: target.id,
      reason: 'auto-bind-ready',
      totalForms: forms.length,
      unboundForms: unboundForms.length,
    };
  }

  if (forms.length === 0) {
    return {
      fields: inferFormFieldsFromComponents(projectComponents),
      targetComponentId: null,
      reason: 'no-form-component',
      totalForms: 0,
      unboundForms: 0,
    };
  }

  if (unboundForms.length === 0) {
    const fallback = forms.length === 1 ? forms[0].children : projectComponents;
    return {
      fields: inferFormFieldsFromComponents(fallback),
      targetComponentId: null,
      reason: 'all-forms-already-bound',
      totalForms: forms.length,
      unboundForms: 0,
    };
  }

  return {
    fields: inferFormFieldsFromComponents(projectComponents),
    targetComponentId: null,
    reason: 'multiple-unbound-forms',
    totalForms: forms.length,
    unboundForms: unboundForms.length,
  };
}

export function bindFormSchemaToProject(
  projectComponents: Component[],
  componentId: number,
  formId: string,
): Component[] {
  const snapshot = deserializeProjectSnapshot(projectComponents);

  if (!snapshot) {
    return updateComponentInTree(projectComponents, componentId, (component) => ({
      ...component,
      props: {
        ...component.props,
        collectData: true,
        formId,
      },
    })) as Component[];
  }

  const nextPages = snapshot.pages.map((page) => ({
    ...page,
    components: updateComponentInTree(page.components, componentId, (component) => ({
      ...component,
      props: {
        ...component.props,
        collectData: true,
        formId,
      },
    })) as Component[],
  }));

  return serializeProjectSnapshot({
    ...snapshot,
    pages: nextPages,
  });
}

function collectFormCandidates(components: Component[]): ProjectFormCandidate[] {
  const result: ProjectFormCandidate[] = [];

  const walk = (nodes: Component[]) => {
    nodes.forEach((node) => {
      if (node.name === 'Form') {
        result.push({
          id: node.id,
          children: (node.children as Component[] | undefined) ?? [],
          formId: typeof node.props?.formId === 'string' && node.props.formId.trim()
            ? node.props.formId.trim()
            : undefined,
        });
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children as Component[]);
      }
    });
  };

  walk(components);
  return result;
}
