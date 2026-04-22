import { apiV1Client } from './client';

export type AssetType = 'image' | 'document' | 'video';

export interface FileAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  userId: string;
  projectId: string | null;
  createdAt: string;
  type: AssetType;
}

export interface FileListResponse {
  files: FileAsset[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface GetFilesParams {
  page?: number;
  pageSize?: number;
  type?: AssetType;
}

export function getBackendOrigin(): string {
  const baseUrl =
    import.meta.env.VITE_API_V1_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api';
  return baseUrl.replace(/\/api(?:\/v1)?$/, '');
}

export function resolveAssetUrl(url: string): string {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//.test(url) || url.startsWith('data:')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${getBackendOrigin()}${url}`;
  }

  return `${getBackendOrigin()}/${url}`;
}

export async function uploadFile(file: File, projectId?: string): Promise<FileAsset> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiV1Client.post<BackendResponse<FileAsset>>(
    '/files/upload',
    formData,
    {
      params: projectId ? { projectId } : undefined,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
}

export async function getFiles(params?: GetFilesParams): Promise<FileListResponse> {
  const response = await apiV1Client.get<BackendResponse<FileListResponse>>(
    '/files',
    { params },
  );

  return response.data.data;
}

export async function deleteFile(id: string): Promise<{ id: string }> {
  const response = await apiV1Client.delete<BackendResponse<{ id: string }>>(
    `/files/${id}`,
  );

  return response.data.data;
}
