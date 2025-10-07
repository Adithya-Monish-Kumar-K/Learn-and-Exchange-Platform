import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios';

interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
}

interface NormalizedError {
  status: number;
  code?: string;
  message: string;
  details?: any;
  raw?: any;
}

type CreatePasswordPayload = { password: string; confirmPassword: string };
type RegisterPayload = { name: string; email: string; phone: string };
type LoginPayload = { email: string; password: string; rememberme?: boolean };
type ResetPasswordPayload = { password: string; confirmPassword?: string };

const MASK = (val?: string) =>
  val ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : '';

const nowISO = () => new Date().toISOString();

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null;
  private user: StoredUser | null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.user = this.getStoredUser();

    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      withCredentials: true,
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  // ---------- Interceptors & Logging ----------
  private setupInterceptors() {
    this.client.interceptors.request.use((config: any) => {
      (config as any).metadata = { start: performance.now() };
      if (this.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      this.logRequest(config);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.logResponse(response.config, response.status, response.data);
        return response;
      },
      (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401 && !this.isUnprotectedPath(error.config?.url)) {
          this.logout();
        }
        this.logError(error);
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private isUnprotectedPath(url?: string) {
    if (!url) return false;
    return [
      '/auth/register',
      '/auth/create-password',
      '/auth/verify-token-register',
      '/auth/forgot-password',
      '/auth/verify-token-forgot',
      '/auth/reset-password',
    ].some((p) => url.includes(p));
  }

  private logRequest(config: AxiosRequestConfig) {
    const method = (config.method || 'get').toUpperCase();
    console.groupCollapsed(
      `%c[API:REQ] ${method} ${config.url}`,
      'color:#000;font-weight:bold'
    );
    console.log('Time:', nowISO());
    console.log('URL:', (config.baseURL ?? '') + (config.url ?? ''));
    console.log('Method:', method);
    if (config.params) console.log('Params:', config.params);
    if (config.data) {
      const safeData = this.sanitizeSensitive(config.data);
      console.log('Body:', safeData);
    }
    if (config.headers?.Authorization) {
      console.log(
        'Auth:',
        MASK(config.headers.Authorization.replace('Bearer ', ''))
      );
    }
    console.groupEnd();
  }

  private logResponse(config: any, status: number, data: any) {
    const duration = config?.metadata?.start
      ? `${(performance.now() - config.metadata.start).toFixed(1)}ms`
      : 'n/a';
    console.groupCollapsed(
      `%c[API:RES] ${config.method?.toUpperCase()} ${config.url} ${status} (${duration})`,
      'color:#0a0;font-weight:bold'
    );
    console.log('Time:', nowISO());
    console.log('Status:', status);
    console.log('Duration:', duration);
    console.log('Data:', this.sanitizeSensitive(data));
    console.groupEnd();
  }

  private logError(error: AxiosError) {
    const status = error.response?.status;
    const url = error.config?.url;
    console.groupCollapsed(
      `%c[API:ERR] ${error.config?.method?.toUpperCase()} ${url} ${status || 'NETWORK'}`,
      'color:#a00;font-weight:bold'
    );
    console.log('Time:', nowISO());
    console.log('Status:', status);
    console.log('Message:', error.message);
    if (error.response?.data)
      console.log(
        'Response Data:',
        this.sanitizeSensitive(error.response.data)
      );
    console.log('Config:', {
      url,
      method: error.config?.method,
      params: error.config?.params,
    });
    console.groupEnd();
  }

  private sanitizeSensitive(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;
    const clone: any = Array.isArray(obj) ? [] : {};
    for (const k of Object.keys(obj)) {
      if (['password', 'confirmPassword'].includes(k.toLowerCase())) {
        clone[k] = '***';
      } else if (k.toLowerCase() === 'token') {
        clone[k] = MASK(String(obj[k]));
      } else {
        clone[k] = obj[k];
      }
    }
    return clone;
  }

  private normalizeError(error: any): NormalizedError {
    if (error?.isNormalized) return error;
    if (error?.response) {
      const status = error.response.status;
      const data: any = error.response.data || {};
      const message =
        data.message ||
        data.error ||
        (status === 400 && 'Bad request') ||
        (status === 401 && 'Unauthorized') ||
        (status === 403 && 'Forbidden') ||
        (status === 404 && 'Not found') ||
        (status === 409 && 'Conflict') ||
        (status === 422 && 'Unprocessable entity') ||
        (status >= 500 && 'Server error') ||
        'Request failed';
      return {
        status,
        code: data.code,
        message,
        details: data.details,
        raw: data,
      };
    }
    if (error?.request) {
      return {
        status: 0,
        message: 'Network error or no response',
        raw: error,
      };
    }
    return {
      status: -1,
      message: error?.message || 'Unknown error',
      raw: error,
    };
  }

  // ---------- Auth State ----------
  isAuthenticated() {
    return !!this.accessToken;
  }

  setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  setUser(user: StoredUser) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.user;
  }

  private getStoredUser(): StoredUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  logout() {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    console.info('[AUTH] Logged out; tokens cleared');
  }

  // ---------- Helper wrapper ----------
  private async exec<T>(label: string, fn: () => Promise<T>): Promise<T> {
    console.groupCollapsed(`%c[FLOW] ${label}`, 'color:#000;font-weight:bold');
    const start = performance.now();
    try {
      const result = await fn();
      console.log('Result:', this.sanitizeSensitive(result));
      console.log('Duration:', `${(performance.now() - start).toFixed(1)}ms`);
      console.groupEnd();
      return result;
    } catch (e: any) {
      console.log('Failed:', e);
      console.log('Duration:', `${(performance.now() - start).toFixed(1)}ms`);
      console.groupEnd();
      throw e;
    }
  }

  // ---------- Backend Calls (Adjusted Flow) ----------

  // 1. Registration (no password) -> email sent
  async register(payload: RegisterPayload) {
    return this.exec('Register', async () => {
      const { data } = await this.client.post('/auth/register', payload);
      return data;
    });
  }

  // 2. Verify register token (email link)
  async verifyRegisterToken(token: string) {
    return this.exec('Verify Register Token', async () => {
      const { data } = await this.client.get('/auth/verify-token-register', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    });
  }

  // 3. Create password (activate account)
  async createPassword(payload: CreatePasswordPayload, token: string) {
    const safe = { ...payload };
    return this.exec('Create Password', async () => {
      const { data } = await this.client.post('/auth/create-password', safe, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.token) this.setToken(data.token);
      if (data?.user) this.setUser(data.user);
      return data;
    });
  }

  // Login (standard)
  async login(payload: LoginPayload) {
    const safe = { email: payload.email, password: payload.password, rememberme: !!payload.rememberme };
    return this.exec('Login', async () => {
      const { data } = await this.client.post('/auth/login', safe);
      if (data?.token) this.setToken(data.token);
      if (data?.user) this.setUser(data.user);
      return data;
    });
  }

  // Forgot password -> email link
  async forgotPassword(payload: { email: string }) {
    const safe = { email: payload.email };
    return this.exec('Forgot Password', async () => {
      const { data } = await this.client.post('/auth/forgot-password', safe);
      return data;
    });
  }

  // Verify forgot token
  async verifyForgotToken(token: string) {
    return this.exec('Verify Forgot Token', async () => {
      const { data } = await this.client.get('/auth/verify-token-forgot', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    });
  }

  // Reset password using verified forgot token
  async resetPassword(payload: ResetPasswordPayload, token: string) {
    const safe = {
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    };
    return this.exec('Reset Password', async () => {
      // Assuming header-based token; if backend uses param pattern /auth/reset-password/:token add fallback
      try {
        const { data } = await this.client.post('/auth/reset-password', safe, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (e: any) {
        if (e.status === 404 || e.status === 400) {
          // Attempt legacy path variant
          const { data } = await this.client.post(
            `/auth/reset-password/${token}`,
            safe
          );
          return data;
        }
        throw e;
      }
    });
  }

  // Current user
  async verifyToken() {
    return this.exec('Verify Session', async () => {
      const { data } = await this.client.get('/auth/me');
      return data;
    });
  }

  // Example placeholder
  async getSidebarUsers() {
    return this.exec('Get Sidebar Users', async () => {
      const { data } = await this.client.get('/chat/sidebar');
      return data;
    });
  }
}

const apiClient = new APIClient();
export default apiClient;
