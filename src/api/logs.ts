import { apiV1Client } from './client';

export interface OperationLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  detail: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface LogsResponse {
  logs: OperationLog[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface GetLogsParams {
  page?: number;
  pageSize?: number;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function getLogs(params?: GetLogsParams): Promise<LogsResponse> {
  const response = await apiV1Client.get<BackendResponse<LogsResponse>>('/logs', {
    params,
  });
  return response.data.data;
}
