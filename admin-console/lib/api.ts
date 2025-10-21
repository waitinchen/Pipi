/**
 * API集成服務
 * 用於連接真實的後端API
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export class ApiService {
  private config: ApiConfig;
  private authToken: string | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:54321',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * 設置認證令牌
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * 獲取認證令牌
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * 清除認證令牌
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * 構建請求頭
   */
  private buildHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * 處理API響應
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      success: true
    };
  }

  /**
   * 重試機制
   */
  private async retryRequest<T>(
    requestFn: () => Promise<Response>,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * GET請求
   */
  async get<T>(
    endpoint: string,
    params: Record<string, any> = {},
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, String(params[key]));
      }
    });

    const requestFn = () => fetch(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders(additionalHeaders),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    return this.retryRequest<T>(requestFn);
  }

  /**
   * POST請求
   */
  async post<T>(
    endpoint: string,
    data: any = {},
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);

    const requestFn = () => fetch(url.toString(), {
      method: 'POST',
      headers: this.buildHeaders(additionalHeaders),
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    return this.retryRequest<T>(requestFn);
  }

  /**
   * PUT請求
   */
  async put<T>(
    endpoint: string,
    data: any = {},
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);

    const requestFn = () => fetch(url.toString(), {
      method: 'PUT',
      headers: this.buildHeaders(additionalHeaders),
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    return this.retryRequest<T>(requestFn);
  }

  /**
   * DELETE請求
   */
  async delete<T>(
    endpoint: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl);

    const requestFn = () => fetch(url.toString(), {
      method: 'DELETE',
      headers: this.buildHeaders(additionalHeaders),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    return this.retryRequest<T>(requestFn);
  }

  /**
   * 分頁請求
   */
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(endpoint, {
      page,
      limit,
      ...params
    });
    return response.data;
  }
}

// 用戶相關API
export class UserApiService {
  constructor(private api: ApiService) {}

  /**
   * 獲取用戶列表
   */
  async getUsers(page: number = 1, limit: number = 10, filters: any = {}) {
    return this.api.getPaginated('/api/users', page, limit, filters);
  }

  /**
   * 獲取用戶詳情
   */
  async getUser(id: string) {
    return this.api.get(`/api/users/${id}`);
  }

  /**
   * 創建用戶
   */
  async createUser(userData: any) {
    return this.api.post('/api/users', userData);
  }

  /**
   * 更新用戶
   */
  async updateUser(id: string, userData: any) {
    return this.api.put(`/api/users/${id}`, userData);
  }

  /**
   * 刪除用戶
   */
  async deleteUser(id: string) {
    return this.api.delete(`/api/users/${id}`);
  }

  /**
   * 獲取用戶統計
   */
  async getUserStats() {
    return this.api.get('/api/users/stats');
  }
}

// 精靈相關API
export class SpiritApiService {
  constructor(private api: ApiService) {}

  /**
   * 獲取精靈列表
   */
  async getSpirits(page: number = 1, limit: number = 10, filters: any = {}) {
    return this.api.getPaginated('/api/spirits', page, limit, filters);
  }

  /**
   * 獲取精靈詳情
   */
  async getSpirit(id: string) {
    return this.api.get(`/api/spirits/${id}`);
  }

  /**
   * 創建精靈
   */
  async createSpirit(spiritData: any) {
    return this.api.post('/api/spirits', spiritData);
  }

  /**
   * 更新精靈
   */
  async updateSpirit(id: string, spiritData: any) {
    return this.api.put(`/api/spirits/${id}`, spiritData);
  }

  /**
   * 刪除精靈
   */
  async deleteSpirit(id: string) {
    return this.api.delete(`/api/spirits/${id}`);
  }

  /**
   * 獲取精靈統計
   */
  async getSpiritStats() {
    return this.api.get('/api/spirits/stats');
  }

  /**
   * 更新精靈狀態
   */
  async updateSpiritStatus(id: string, status: string) {
    return this.api.put(`/api/spirits/${id}/status`, { status });
  }
}

// 聊天相關API
export class ChatApiService {
  constructor(private api: ApiService) {}

  /**
   * 獲取聊天記錄
   */
  async getChats(page: number = 1, limit: number = 10, filters: any = {}) {
    return this.api.getPaginated('/api/chats', page, limit, filters);
  }

  /**
   * 獲取聊天詳情
   */
  async getChat(id: string) {
    return this.api.get(`/api/chats/${id}`);
  }

  /**
   * 刪除聊天記錄
   */
  async deleteChat(id: string) {
    return this.api.delete(`/api/chats/${id}`);
  }

  /**
   * 獲取聊天統計
   */
  async getChatStats() {
    return this.api.get('/api/chats/stats');
  }

  /**
   * 標記聊天為敏感內容
   */
  async flagChat(id: string, reason: string) {
    return this.api.post(`/api/chats/${id}/flag`, { reason });
  }
}

// 分析相關API
export class AnalyticsApiService {
  constructor(private api: ApiService) {}

  /**
   * 獲取儀表板統計
   */
  async getDashboardStats() {
    return this.api.get('/api/analytics/dashboard');
  }

  /**
   * 獲取用戶增長數據
   */
  async getUserGrowthData(period: string = '30d') {
    return this.api.get('/api/analytics/user-growth', { period });
  }

  /**
   * 獲取精靈活躍度數據
   */
  async getSpiritActivityData(period: string = '30d') {
    return this.api.get('/api/analytics/spirit-activity', { period });
  }

  /**
   * 獲取聊天量數據
   */
  async getChatVolumeData(period: string = '30d') {
    return this.api.get('/api/analytics/chat-volume', { period });
  }

  /**
   * 獲取實時指標
   */
  async getRealtimeMetrics() {
    return this.api.get('/api/analytics/realtime');
  }
}

// 系統相關API
export class SystemApiService {
  constructor(private api: ApiService) {}

  /**
   * 獲取系統健康狀態
   */
  async getSystemHealth() {
    return this.api.get('/api/system/health');
  }

  /**
   * 獲取系統配置
   */
  async getSystemConfig() {
    return this.api.get('/api/system/config');
  }

  /**
   * 更新系統配置
   */
  async updateSystemConfig(config: any) {
    return this.api.put('/api/system/config', config);
  }

  /**
   * 獲取日誌
   */
  async getLogs(level: string = 'info', limit: number = 100) {
    return this.api.get('/api/system/logs', { level, limit });
  }
}

// 認證相關API
export class AuthApiService {
  constructor(private api: ApiService) {}

  /**
   * 登入
   */
  async login(email: string, password: string) {
    const response = await this.api.post('/api/auth/login', { email, password });
    if (response.success && response.data.token) {
      this.api.setAuthToken(response.data.token);
    }
    return response;
  }

  /**
   * 登出
   */
  async logout() {
    const response = await this.api.post('/api/auth/logout');
    this.api.clearAuthToken();
    return response;
  }

  /**
   * 獲取當前用戶信息
   */
  async getCurrentUser() {
    return this.api.get('/api/auth/me');
  }

  /**
   * 刷新令牌
   */
  async refreshToken() {
    return this.api.post('/api/auth/refresh');
  }
}

// 全局API服務實例
export const apiService = new ApiService();
export const userApi = new UserApiService(apiService);
export const spiritApi = new SpiritApiService(apiService);
export const chatApi = new ChatApiService(apiService);
export const analyticsApi = new AnalyticsApiService(apiService);
export const systemApi = new SystemApiService(apiService);
export const authApi = new AuthApiService(apiService);

// React Hook for API calls
export function useApi() {
  return {
    api: apiService,
    user: userApi,
    spirit: spiritApi,
    chat: chatApi,
    analytics: analyticsApi,
    system: systemApi,
    auth: authApi
  };
}

// 錯誤處理工具
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 請求攔截器
export function setupApiInterceptors() {
  // 請求前攔截器
  apiService.setAuthToken(localStorage.getItem('auth_token') || '');
  
  // 可以在這裡添加全局錯誤處理
  // 例如：自動重定向到登入頁面、顯示錯誤通知等
}


