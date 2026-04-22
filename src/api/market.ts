import { apiV1Client } from './client';

export interface CustomComponentMarketItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string | null;
  thumbnail: string | null;
  code: string;
  defaultProps: Record<string, unknown>;
  setterConfig: Array<Record<string, unknown>>;
  version: string;
  downloads: number;
  isPublic: boolean;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  reviewCount?: number;
  avgRating?: number;
  reviews?: MarketReview[];
}

export interface CreateMarketComponentPayload {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string | null;
  thumbnail: string | null;
  code: string;
  defaultProps: Record<string, unknown>;
  setterConfig: Array<Record<string, unknown>>;
  version: string;
  isPublic: boolean;
}

export interface MarketTemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string | null;
  components: any[];
  pages: any[];
  dataSources: Record<string, unknown> | unknown[];
  variables: Record<string, unknown>;
  sharedStyles: any[];
  themeId: string | null;
  useCount: number;
  isPublic: boolean;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  reviewCount?: number;
  avgRating?: number;
  reviews?: MarketReview[];
}

export interface CreateMarketTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string | null;
  components: any[];
  pages?: any[];
  dataSources?: Record<string, unknown> | unknown[];
  variables?: Record<string, unknown>;
  sharedStyles?: any[];
  themeId?: string | null;
  isPublic: boolean;
}

export interface UpdateMarketTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string | null;
  isPublic?: boolean;
}

export interface MarketTemplateDeleteResponse {
  id: string;
}

export interface MarketReview {
  id: string;
  userId: string;
  targetType: 'component' | 'template';
  targetId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function getMarketComponents(params?: Record<string, unknown>) {
  const response = await apiV1Client.get<
    BackendResponse<{
      components: CustomComponentMarketItem[];
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>
  >('/market/components', { params });
  return response.data.data;
}

export async function getMarketComponent(id: string) {
  const response = await apiV1Client.get<BackendResponse<CustomComponentMarketItem>>(
    `/market/components/${id}`,
  );
  return response.data.data;
}

export async function createMarketComponent(data: CreateMarketComponentPayload) {
  const response = await apiV1Client.post<BackendResponse<CustomComponentMarketItem>>(
    '/market/components',
    data,
  );
  return response.data.data;
}

export async function installMarketComponent(id: string) {
  const response = await apiV1Client.post<BackendResponse<CustomComponentMarketItem>>(
    `/market/components/${id}/install`,
  );
  return response.data.data;
}

export async function getMarketTemplates(params?: Record<string, unknown>) {
  const response = await apiV1Client.get<
    BackendResponse<{
      templates: MarketTemplateItem[];
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>
  >('/market/templates', { params });
  return response.data.data;
}

export async function getMarketTemplate(id: string) {
  const response = await apiV1Client.get<BackendResponse<MarketTemplateItem>>(
    `/market/templates/${id}`,
  );
  return response.data.data;
}

export async function createMarketTemplate(data: CreateMarketTemplateRequest) {
  const response = await apiV1Client.post<BackendResponse<MarketTemplateItem>>(
    '/market/templates',
    data,
  );
  return response.data.data;
}

export async function getMyMarketTemplates() {
  const response = await apiV1Client.get<BackendResponse<MarketTemplateItem[]>>(
    '/market/templates/mine',
  );
  return response.data.data;
}

export async function updateMarketTemplate(id: string, data: UpdateMarketTemplateRequest) {
  const response = await apiV1Client.put<BackendResponse<MarketTemplateItem>>(
    `/market/templates/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteMarketTemplate(id: string) {
  const response = await apiV1Client.delete<BackendResponse<MarketTemplateDeleteResponse>>(
    `/market/templates/${id}`,
  );
  return response.data.data;
}

export async function useMarketTemplate(id: string) {
  const response = await apiV1Client.post<BackendResponse<MarketTemplateItem>>(
    `/market/templates/${id}/use`,
  );
  return response.data.data;
}

export async function toggleMarketLike(targetType: 'component' | 'template', targetId: string) {
  const response = await apiV1Client.post<
    BackendResponse<{ liked: boolean; count: number }>
  >('/market/like', {
    targetType,
    targetId,
  });
  return response.data.data;
}

export async function getMarketLikes(targetType: 'component' | 'template', targetId: string) {
  const response = await apiV1Client.get<
    BackendResponse<{ liked: boolean; count: number }>
  >(`/market/${targetType}/${targetId}/likes`);
  return response.data.data;
}

export async function createMarketReview(data: {
  targetType: 'component' | 'template';
  targetId: string;
  rating: number;
  content: string;
}) {
  const response = await apiV1Client.post<BackendResponse<MarketReview>>(
    '/market/reviews',
    data,
  );
  return response.data.data;
}

export async function getMarketReviews(
  targetType: 'component' | 'template',
  targetId: string,
  page = 1,
  pageSize = 10,
) {
  const response = await apiV1Client.get<
    BackendResponse<{
      reviews: MarketReview[];
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>
  >(`/market/${targetType}/${targetId}/reviews`, {
    params: { page, pageSize },
  });
  return response.data.data;
}
