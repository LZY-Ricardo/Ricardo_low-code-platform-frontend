import { apiV1Client } from './client';

export interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  projectId: string;
  pageId: string | null;
  isActive: boolean;
  submissions: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormRecord {
  id: string;
  formSchemaId: string;
  data: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  submittedAt: string;
}

export interface FormListResponse {
  forms: FormSchema[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface FormRecordsResponse {
  records: FormRecord[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface FormStats {
  totalSubmissions: number;
  todaySubmissions: number;
  trend: Array<{ date: string; count: number }>;
  fieldDistribution: Record<string, Record<string, unknown>>;
}

interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function createForm(data: {
  name: string;
  description?: string;
  fields: FormField[];
  projectId: string;
  pageId?: string | null;
  isActive?: boolean;
}): Promise<FormSchema> {
  const response = await apiV1Client.post<BackendResponse<FormSchema>>('/forms', data);
  return response.data.data;
}

export async function getForms(page = 1, pageSize = 20): Promise<FormListResponse> {
  const response = await apiV1Client.get<BackendResponse<FormListResponse>>('/forms', {
    params: { page, pageSize },
  });
  return response.data.data;
}

export async function getForm(id: string): Promise<FormSchema> {
  const response = await apiV1Client.get<BackendResponse<FormSchema>>(`/forms/${id}`);
  return response.data.data;
}

export async function updateForm(
  id: string,
  data: Partial<Pick<FormSchema, 'name' | 'description' | 'fields' | 'isActive'>>,
): Promise<FormSchema> {
  const response = await apiV1Client.put<BackendResponse<FormSchema>>(`/forms/${id}`, data);
  return response.data.data;
}

export async function deleteForm(id: string): Promise<{ id: string }> {
  const response = await apiV1Client.delete<BackendResponse<{ id: string }>>(`/forms/${id}`);
  return response.data.data;
}

export async function submitForm(
  formId: string,
  payload: Record<string, unknown>,
): Promise<FormRecord> {
  const response = await apiV1Client.post<BackendResponse<FormRecord>>(
    `/forms/${formId}/submit`,
    payload,
  );
  return response.data.data;
}

export async function getRecords(
  formId: string,
  page = 1,
  pageSize = 20,
): Promise<FormRecordsResponse> {
  const response = await apiV1Client.get<BackendResponse<FormRecordsResponse>>(
    `/forms/${formId}/records`,
    { params: { page, pageSize } },
  );
  return response.data.data;
}

export async function getStats(formId: string): Promise<FormStats> {
  const response = await apiV1Client.get<BackendResponse<FormStats>>(`/forms/${formId}/stats`);
  return response.data.data;
}

export async function exportFormCSV(formId: string): Promise<Blob> {
  const response = await apiV1Client.get(`/forms/${formId}/export`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}
