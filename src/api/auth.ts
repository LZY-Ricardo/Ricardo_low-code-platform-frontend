/**
 * 认证相关 API
 */
import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/api';

/** 通用后端响应格式 */
interface BackendResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<BackendResponse<{
    accessToken: string;
    expiresIn: number;
    user: User;
  }>>('/auth/login', data);
  
  // 转换后端响应格式为前端期望格式
  return {
    token: response.data.data.accessToken,
    user: response.data.data.user,
  };
}

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<BackendResponse<User>>('/auth/register', data);
  return {
    message: response.data.message,
  };
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<BackendResponse<User>>('/auth/me');
  return response.data.data;
}

export async function updateProfile(data: {
  username?: string;
  avatarUrl?: string | null;
}): Promise<User> {
  const response = await apiClient.put<BackendResponse<User>>('/auth/profile', data);
  return response.data.data;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  const response = await apiClient.put<BackendResponse<{ success: boolean }>>(
    '/auth/password',
    data,
  );
  return response.data.data;
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await apiClient.post<BackendResponse<{
    accessToken: string;
    expiresIn: number;
  }>>('/auth/refresh');
  return response.data.data;
}
