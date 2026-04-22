import type { CreateMarketTemplateRequest } from '../../../api/market';

type PayloadSource = {
  components: any[];
  pages?: any[];
  dataSources?: unknown[] | Record<string, unknown>;
  variables?: Record<string, unknown>;
  sharedStyles?: any[];
  themeId?: string | null;
};

interface BuildMarketTemplatePayloadInput {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string | null;
  source: PayloadSource;
}

export function buildMarketTemplatePayload(
  input: BuildMarketTemplatePayloadInput,
): CreateMarketTemplateRequest {
  return {
    name: input.name,
    description: input.description ?? '',
    category: input.category ?? 'general',
    tags: input.tags ?? [],
    thumbnail: input.thumbnail ?? null,
    components: input.source.components,
    pages: input.source.pages ?? [],
    dataSources: input.source.dataSources ?? [],
    variables: input.source.variables ?? {},
    sharedStyles: input.source.sharedStyles ?? [],
    themeId: input.source.themeId ?? null,
    isPublic: false,
  };
}
