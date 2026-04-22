import { apiV1Client } from './client';
import type { Component } from '../editor/stores/components';

export interface TrashProject {
  id: string;
  name: string;
  components: Component[];
  userId: string;
  publishUrl?: string | null;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function getTrash(page = 1, pageSize = 20) {
  const response = await apiV1Client.get<
    BackendResponse<{
      projects: TrashProject[];
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>
  >('/trash', {
    params: { page, pageSize },
  });
  return response.data.data;
}

export async function restoreProject(id: string) {
  const response = await apiV1Client.post<BackendResponse<TrashProject>>(
    `/trash/${id}/restore`,
  );
  return response.data.data;
}

export async function permanentDeleteProject(id: string) {
  const response = await apiV1Client.delete<BackendResponse<{ id: string }>>(
    `/trash/${id}`,
  );
  return response.data.data;
}
