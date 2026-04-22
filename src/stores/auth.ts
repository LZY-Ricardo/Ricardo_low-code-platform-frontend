/**
 * 认证状态管理
 */
import { create } from 'zustand';
import * as authApi from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  // 方法
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 初始状态
  user: null,
  token: localStorage.getItem('lowcode_token'),
  isAuthenticated: !!localStorage.getItem('lowcode_token'),
  loading: false,

  /**
   * 登录
   */
  login: async (data: LoginRequest) => {
    set({ loading: true });
    try {
      const response = await authApi.login(data);
      const { token, user } = response;

      // 保存 token 到 LocalStorage
      localStorage.setItem('lowcode_token', token);

      // 更新状态
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * 注册
   */
  register: async (data: RegisterRequest) => {
    set({ loading: true });
    try {
      await authApi.register(data);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * 退出登录
   */
  logout: () => {
    localStorage.removeItem('lowcode_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /**
   * 检查登录状态（页面加载时调用）
   */
  checkAuth: async () => {
    const token = localStorage.getItem('lowcode_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      // 验证 token 有效性
      const user = await authApi.getCurrentUser();
      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch {
      // token 无效，清除登录状态
      localStorage.removeItem('lowcode_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * 设置用户信息
   */
  setUser: (user: User | null) => {
    set({ user });
  },

  /**
   * 更新 Token（刷新后调用）
   */
  updateToken: (token: string) => {
    localStorage.setItem('lowcode_token', token);
    set({ token });
  },
}));
