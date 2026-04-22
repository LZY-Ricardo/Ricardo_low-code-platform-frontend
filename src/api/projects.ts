/**
 * 项目管理相关 API
 */
import { apiClient } from './client';
import type { Component } from '../editor/stores/components';

// ==================== 类型定义 ====================

/** 项目信息 */
export interface ProjectData {
  id: string;
  name: string;
  components: Component[];
  userId: string;
  publishUrl?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 创建项目请求 */
export interface CreateProjectRequest {
  name: string;
  components?: Component[];
}

/** 更新项目请求 */
export interface UpdateProjectRequest {
  name?: string;
  components?: Component[];
}

/** 批量导入项目请求 */
export interface BatchImportRequest {
  projects: {
    name: string;
    components: Component[];
  }[];
}

/** 批量导入响应 */
export interface BatchImportResponse {
  imported: number;
  failed: number;
  projects: {
    id: string;
    name: string;
  }[];
}

/** 项目列表响应 */
export interface ProjectListResponse {
  projects: ProjectData[];
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
 * 创建项目
 */
export async function createProject(
  data: CreateProjectRequest
): Promise<ProjectData> {
  const response = await apiClient.post<BackendResponse<ProjectData>>(
    '/projects',
    data
  );
  return response.data.data;
}

/**
 * 获取项目列表
 */
export async function getProjects(
  page = 1,
  pageSize = 100
): Promise<ProjectListResponse> {
  const response = await apiClient.get<BackendResponse<ProjectListResponse>>(
    '/projects',
    {
      params: { page, pageSize },
    }
  );
  return response.data.data;
}

/**
 * 获取单个项目详情
 */
export async function getProject(id: string): Promise<ProjectData> {
  const response = await apiClient.get<BackendResponse<ProjectData>>(
    `/projects/${id}`
  );
  return response.data.data;
}

/**
 * 更新项目
 */
export async function updateProject(
  id: string,
  data: UpdateProjectRequest
): Promise<ProjectData> {
  const response = await apiClient.put<BackendResponse<ProjectData>>(
    `/projects/${id}`,
    data
  );
  return response.data.data;
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<{ id: string }> {
  const response = await apiClient.delete<BackendResponse<{ id: string }>>(
    `/projects/${id}`
  );
  return response.data.data;
}

/**
 * 批量导入项目
 */
export async function batchImportProjects(
  data: BatchImportRequest
): Promise<BatchImportResponse> {
  const response = await apiClient.post<BackendResponse<BatchImportResponse>>(
    '/projects/batch-import',
    data
  );
  return response.data.data;
}
