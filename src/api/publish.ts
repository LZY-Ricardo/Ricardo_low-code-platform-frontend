import { apiV1Client } from './client';

export interface PublishRequest {
  slug?: string;
  title?: string;
  description?: string;
}

export interface PublishResult {
  id: string;
  version: number;
  publishUrl: string;
  status: string;
  publishedBy: string;
  createdAt: string;
  url: string;
}

export interface PublishedVersion {
  id: string;
  version: number;
  publishUrl: string;
  title: string | null;
  description: string | null;
  status: string;
  publishedBy: string;
  createdAt: string;
}

export interface VersionsResponse {
  versions: PublishedVersion[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PublishedPagePayload {
  html: string;
  title: string | null;
  description: string | null;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function publishProject(
  projectId: string,
  data?: PublishRequest,
): Promise<PublishResult> {
  const response = await apiV1Client.post<BackendResponse<PublishResult>>(
    `/projects/${projectId}/publish`,
    data ?? {},
  );
  return response.data.data;
}

export async function getVersions(
  projectId: string,
  page = 1,
  pageSize = 10,
): Promise<VersionsResponse> {
  const response = await apiV1Client.get<BackendResponse<VersionsResponse>>(
    `/projects/${projectId}/versions`,
    {
      params: { page, pageSize },
    },
  );
  return response.data.data;
}

export async function rollbackVersion(
  projectId: string,
  versionId: string,
): Promise<{ id: string; version: number; publishUrl: string }> {
  const response = await apiV1Client.post<
    BackendResponse<{ id: string; version: number; publishUrl: string }>
  >(`/projects/${projectId}/versions/${versionId}/rollback`);
  return response.data.data;
}

export async function archiveVersion(projectId: string, versionId: string): Promise<void> {
  await apiV1Client.delete(`/projects/${projectId}/versions/${versionId}`);
}

export async function getPublishedPage(publishUrl: string): Promise<PublishedPagePayload> {
  const response = await apiV1Client.get<BackendResponse<PublishedPagePayload>>(
    `/p/${publishUrl}`,
  );
  return response.data.data;
}

export function getPublishedPageBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  return window.location.origin;
}

export function isLocalPublishedPageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return LOCAL_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function buildPublishedPageUrl(publishUrl: string): string {
  return `${getPublishedPageBaseUrl()}/p/${publishUrl}`;
}
