/**
 * HTTP 客户端配置
 */
import axios, { AxiosError } from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '../types/api';
import { useAuthStore } from '../stores/auth';
import { showError, showWarning } from '../utils/antdApp';

function createClient(baseURL: string, timeout = 10000): AxiosInstance {
  return axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_V1_BASE_URL = import.meta.env.VITE_API_V1_BASE_URL || 'http://localhost:3000/api/v1';

// 现有模块沿用 /api，新扩展模块统一使用 /api/v1
export const apiClient = createClient(API_BASE_URL);

export const apiV1Client = createClient(API_V1_BASE_URL);

export const aiClient = createClient(
  API_BASE_URL,
  Number(import.meta.env.VITE_AI_TIMEOUT_MS || '90000'),
);

const refreshClient = createClient(API_BASE_URL);

// --- Token 刷新队列机制 ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
  client: AxiosInstance;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject, config, client }) => {
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      resolve(client(config));
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('lowcode_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 处理 401 未授权
      if (error.response?.status === 401) {
        // 刷新请求本身失败，不再重试
        if (originalRequest.url?.includes('/auth/refresh')) {
          localStorage.removeItem('lowcode_token');
          showWarning('登录已过期，请重新登录');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 已经重试过，不再循环
        if (originalRequest._retry) {
          localStorage.removeItem('lowcode_token');
          showWarning('登录已过期，请重新登录');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 如果正在刷新，将请求加入队列等待
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest, client });
          });
        }

        // 开始刷新
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const data = await refreshClient.post<{
            code: number;
            message: string;
            data: { accessToken: string; expiresIn: number };
          }>('/auth/refresh');
          const refreshPayload = data.data.data;
          const newToken = refreshPayload.accessToken;

          // 更新存储
          localStorage.setItem('lowcode_token', newToken);

          // 更新 auth store
          useAuthStore.getState().updateToken(newToken);

          // 重试队列中所有等待的请求
          processQueue(null, newToken);

          // 重试原始请求
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清空队列并跳转登录页
          processQueue(refreshError, null);
          localStorage.removeItem('lowcode_token');
          showWarning('登录已过期，请重新登录');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 处理其他错误
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);

      return Promise.reject(error);
    },
  );
}

attachInterceptors(apiClient);
attachInterceptors(apiV1Client);
attachInterceptors(aiClient);

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
