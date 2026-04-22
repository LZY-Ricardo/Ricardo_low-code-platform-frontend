/**
 * API 类型定义
 */

// ==================== 用户相关类型 ====================

/** 用户信息 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

// ==================== 认证相关类型 ====================

/** 登录请求 */
export interface LoginRequest {
  username: string;  // 用户名或邮箱
  password: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  user: User;
}

/** 注册请求 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** 注册响应 */
export interface RegisterResponse {
  message: string;
}

// ==================== API 错误类型 ====================

/** API 错误响应 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ==================== 通用响应类型 ====================

/** 通用成功响应 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}
