/**
 * HTTP 客户端配置
 */
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';
import { showError, showWarning } from '../utils/antdApp';

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('lowcode_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem('lowcode_token');
      showWarning('登录已过期，请重新登录');
      // 跳转到登录页
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 处理其他错误
    const errorMessage = getErrorMessage(error);
    showError(errorMessage);

    return Promise.reject(error);
  }
);

/**
 * 获取错误信息
 */
function getErrorMessage(error: AxiosError<ApiError>): string {
  if (error.response) {
    const { status, data } = error.response;
    
    // 后端返回的错误信息
    if (data?.message) {
      return data.message;
    }

    // 根据状态码返回默认错误信息
    switch (status) {
      case 400:
        return '请求参数错误，请检查输入';
      case 401:
        return '用户名或密码错误';
      case 403:
        return '无权访问该资源';
      case 404:
        return '请求的资源不存在';
      case 409:
        return '用户名或邮箱已存在';
      case 500:
        return '服务器错误，请稍后重试';
      default:
        return `请求失败 (${status})`;
    }
  }

  // 网络错误
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    return '网络连接失败，请检查网络';
  }

  // 请求超时
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试';
  }

  return '未知错误，请稍后重试';
}
