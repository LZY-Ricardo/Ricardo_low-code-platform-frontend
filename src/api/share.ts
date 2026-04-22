import { apiV1Client } from './client';

export interface ProjectShare {
  id: string;
  shareToken: string;
  permission: 'view' | 'edit';
  expiresAt: string | null;
  isActive?: boolean;
  createdAt?: string;
  hasPassword: boolean;
  url: string;
}

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function createShare(
  projectId: string,
  data: { permission: 'view' | 'edit'; expiresIn?: number; password?: string },
): Promise<ProjectShare> {
  const response = await apiV1Client.post<BackendResponse<ProjectShare>>(
    `/projects/${projectId}/share`,
    data,
  );
  return response.data.data;
}

export async function getShares(projectId: string): Promise<ProjectShare[]> {
  const response = await apiV1Client.get<BackendResponse<ProjectShare[]>>(
    `/projects/${projectId}/shares`,
  );
  return response.data.data;
}

export async function updateShare(
  projectId: string,
  shareId: string,
  data: { permission?: 'view' | 'edit'; expiresIn?: number; password?: string },
): Promise<ProjectShare> {
  const response = await apiV1Client.put<BackendResponse<ProjectShare>>(
    `/projects/${projectId}/shares/${shareId}`,
    data,
  );
  return response.data.data;
}

export async function revokeShare(projectId: string, shareId: string): Promise<void> {
  await apiV1Client.delete(`/projects/${projectId}/shares/${shareId}`);
}

export async function accessSharedProject(
  token: string,
  password?: string,
): Promise<{ permission: 'view' | 'edit'; project: Record<string, unknown> }> {
  const response = await apiV1Client.post<
    BackendResponse<{ permission: 'view' | 'edit'; project: Record<string, unknown> }>
  >(`/s/${token}/access`, password ? { password } : {});
  return response.data.data;
}

export async function updateSharedProject(
  token: string,
  data: { password?: string; name?: string; components?: unknown },
) {
  const response = await apiV1Client.put<
    BackendResponse<Record<string, unknown>>
  >(`/s/${token}`, data);
  return response.data.data;
}

export async function addCollaborator(
  projectId: string,
  data: { username: string; role: 'editor' | 'viewer' },
): Promise<Collaborator> {
  const response = await apiV1Client.post<BackendResponse<Collaborator>>(
    `/projects/${projectId}/collaborators`,
    data,
  );
  return response.data.data;
}

export async function getCollaborators(projectId: string): Promise<Collaborator[]> {
  const response = await apiV1Client.get<BackendResponse<Collaborator[]>>(
    `/projects/${projectId}/collaborators`,
  );
  return response.data.data;
}

export async function updateCollaboratorRole(
  projectId: string,
  userId: string,
  role: 'editor' | 'viewer',
): Promise<Collaborator> {
  const response = await apiV1Client.put<BackendResponse<Collaborator>>(
    `/projects/${projectId}/collaborators/${userId}`,
    { role },
  );
  return response.data.data;
}

export async function removeCollaborator(projectId: string, userId: string): Promise<void> {
  await apiV1Client.delete(`/projects/${projectId}/collaborators/${userId}`);
}

export interface CollaboratedProject {
  id: string;
  name: string;
  components: unknown[];
  publishUrl: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; username: string; email: string };
  role: 'editor' | 'viewer';
}

export async function getMyCollaborations(): Promise<CollaboratedProject[]> {
  const response = await apiV1Client.get<BackendResponse<CollaboratedProject[]>>(
    '/collaborations',
  );
  return response.data.data;
}

export function buildShareUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
