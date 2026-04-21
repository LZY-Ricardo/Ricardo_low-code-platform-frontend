/**
 * 模板管理相关 API
 */
import { apiClient } from './client';
import type { Component } from '../editor/stores/components';
import type { EditorPage } from '../editor/utils/page-model';
import type { DataSource } from '../editor/stores/data-source';
import type { SharedStyleDefinition } from '../editor/stores/shared-styles';

// ==================== 类型定义 ====================

/** 模板分类 */
export type TemplateCategory = 'general' | 'form' | 'dashboard' | 'landing' | 'layout';

/** 分类显示名称映射 */
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  general: '通用',
  form: '表单',
  dashboard: '数据看板',
  landing: '落地页',
  layout: '布局',
};

/** 模板列表项（不含完整组件数据） */
export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string | null;
  builtIn: boolean;
  useCount: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 模板详情（含完整组件数据） */
export interface TemplateDetail extends TemplateItem {
  components: Component[];
  pages: EditorPage[];
  dataSources: DataSource[];
  variables: Record<string, unknown>;
  sharedStyles: SharedStyleDefinition[];
  themeId: string | null;
}

/** 创建模板请求 */
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: TemplateCategory;
  thumbnail?: string;
  components: Component[];
  pages?: EditorPage[];
  dataSources?: DataSource[];
  variables?: Record<string, unknown>;
  sharedStyles?: SharedStyleDefinition[];
  themeId?: string | null;
}

/** 更新模板请求 */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  thumbnail?: string;
}

/** 模板列表查询参数 */
export interface TemplateQueryParams {
  page?: number;
  pageSize?: number;
  category?: TemplateCategory;
  search?: string;
  builtIn?: boolean;
  mine?: boolean;
}

/** 模板列表响应 */
export interface TemplateListResponse {
  templates: TemplateItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/** 通用后端响应格式 */
interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== API 方法 ====================

/**
 * 获取模板列表
 */
export async function getTemplates(
  params?: TemplateQueryParams
): Promise<TemplateListResponse> {
  const response = await apiClient.get<BackendResponse<TemplateListResponse>>(
    '/templates',
    { params }
  );
  return response.data.data;
}

/**
 * 获取模板详情
 */
export async function getTemplate(id: string): Promise<TemplateDetail> {
  const response = await apiClient.get<BackendResponse<TemplateDetail>>(
    `/templates/${id}`
  );
  return response.data.data;
}

/**
 * 创建模板
 */
export async function createTemplate(
  data: CreateTemplateRequest
): Promise<TemplateDetail> {
  const response = await apiClient.post<BackendResponse<TemplateDetail>>(
    '/templates',
    data
  );
  return response.data.data;
}

/**
 * 更新模板
 */
export async function updateTemplate(
  id: string,
  data: UpdateTemplateRequest
): Promise<TemplateDetail> {
  const response = await apiClient.put<BackendResponse<TemplateDetail>>(
    `/templates/${id}`,
    data
  );
  return response.data.data;
}

/**
 * 删除模板
 */
export async function deleteTemplate(id: string): Promise<{ id: string }> {
  const response = await apiClient.delete<BackendResponse<{ id: string }>>(
    `/templates/${id}`
  );
  return response.data.data;
}

/**
 * 使用模板（增加使用计数）
 */
export async function useTemplate(id: string): Promise<void> {
  await apiClient.post(`/templates/${id}/use`);
}
