import type { CreateMarketComponentPayload } from '../api/market';

export interface PublishComponentFormValues {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  thumbnail: string;
  code: string;
  defaultPropsText: string;
  setterConfigText: string;
  version: string;
  isPublic: boolean;
}

export function createPublishComponentFormValues(): PublishComponentFormValues {
  return {
    name: '',
    displayName: '',
    description: '',
    category: 'custom',
    icon: '',
    thumbnail: '',
    code: '',
    defaultPropsText: '{}',
    setterConfigText: '[]',
    version: '1.0.0',
    isPublic: true,
  };
}

export function parseStructuredJsonInput(
  value: string,
  field: 'defaultProps',
): Record<string, unknown>;
export function parseStructuredJsonInput(
  value: string,
  field: 'setterConfig',
): Array<Record<string, unknown>>;
export function parseStructuredJsonInput(
  value: string,
  field: 'defaultProps' | 'setterConfig',
): Record<string, unknown> | Array<Record<string, unknown>> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${field} 不是合法的 JSON`);
  }

  if (field === 'defaultProps') {
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error('defaultProps 必须是 JSON 对象');
    }
    return parsed as Record<string, unknown>;
  }

  if (!Array.isArray(parsed)) {
    throw new Error('setterConfig 必须是 JSON 数组');
  }

  return parsed as Array<Record<string, unknown>>;
}

export function buildCreateMarketComponentPayload(values: PublishComponentFormValues) {
  const icon = values.icon.trim();
  const thumbnail = values.thumbnail.trim();

  return {
    name: values.name.trim(),
    displayName: values.displayName.trim(),
    description: values.description.trim(),
    category: values.category.trim() || 'custom',
    icon: icon || null,
    thumbnail: thumbnail || null,
    code: values.code.trim(),
    defaultProps: parseStructuredJsonInput(values.defaultPropsText, 'defaultProps'),
    setterConfig: parseStructuredJsonInput(values.setterConfigText, 'setterConfig'),
    version: values.version.trim() || '1.0.0',
    isPublic: values.isPublic,
  } satisfies CreateMarketComponentPayload;
}
