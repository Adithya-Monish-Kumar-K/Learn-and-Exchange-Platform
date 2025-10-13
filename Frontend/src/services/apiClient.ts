import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios';

interface StoredUser {
  id: string;
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
  private isRefreshing = false;
  private refreshQueue: {
    resolve: (v?: any) => void;
    reject: (e: any) => void;
  }[] = [];
  private refreshTimer: number | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.user = this.getStoredUser();
    this.client = axios.create({
      baseURL:
        import.meta.env.VITE_API_URL ||
        'https://skill-exchange-platform-9s6c.onrender.com/api',
      withCredentials: true,
      timeout: 15000,
    });
    this.setupInterceptors();
    if (this.accessToken) {
      this.scheduleProactiveRefresh(this.accessToken);
    }
  }

  // Get axios client instance
  getClient(): AxiosInstance {
    return this.client;
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
      async (error: AxiosError) => {
        const original: any = error.config;
        const status = error.response?.status;

        // Attempt silent refresh on 401 (once)
        if (
          status === 401 &&
          !original._retry &&
          !this.isUnprotectedPath(original?.url)
        ) {
          original._retry = true;
          try {
            const newToken = await this.refreshAccessToken();
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return this.client(original);
          } catch (refreshErr) {
            this.logout();
          }
        }

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
    console.log('Checking authentication, token:', !!this.accessToken);
    return !!this.accessToken;
  }

  private decodeJwt(token: string): { exp?: number } {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  private scheduleProactiveRefresh(token: string) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    const { exp } = this.decodeJwt(token);
    if (!exp) return;
    const expiresMs = exp * 1000;
    const now = Date.now();
    const lead = 60 * 1000; // refresh 60s before expiry
    const delay = Math.max(expiresMs - now - lead, 0);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshAccessToken().catch(() => {
        this.logout();
      });
    }, delay);
  }

  setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
    this.scheduleProactiveRefresh(token);
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
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    console.info('[AUTH] Logged out; tokens cleared');
  }

  private processRefreshQueue(error: any, newToken?: string) {
    this.refreshQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(newToken);
    });
    this.refreshQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }
    this.isRefreshing = true;
    try {
      console.log('[AUTH] Refreshing access token...');
      const { data } = await this.client.post('/auth/refresh-token'); // cookie supplies refresh
      const newToken = data?.token;
      if (!newToken) throw new Error('No token returned on refresh');
      this.setToken(newToken);
      this.processRefreshQueue(null, newToken);
      return newToken;
    } catch (e) {
      this.processRefreshQueue(e);
      throw e;
    } finally {
      this.isRefreshing = false;
    }
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
    console.log(token);

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
    const safe = {
      email: payload.email,
      password: payload.password,
      rememberme: !!payload.rememberme,
    };
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
      const { data } = await this.client.get('/auth/verify-token');
      return data;
    });
  }

  // Fetch full user profile by email
  async getUserByEmail(email: string) {
    return this.exec('Get User By Email', async () => {
      const { data } = await this.client.post('/users/email', { email });
      return data;
    });
  }

  // Partial update user (by email) - only allowed editable fields
  async updateUserByEmail(
    email: string,
    payload: {
      name?: string;
      phone?: string;
      bio?: string;
      skills?: Array<{ name: string; level?: string; years?: number }>;
      qualifications?: Array<{
        title: string;
        institution: string;
        year: number;
      }>;
      experience?: Array<{
        company: string;
        role: string;
        duration: string;
        description?: string;
      }>;
      links?: string[];
    }
  ) {
    // Build body with ONLY allowed, non-empty fields to avoid zod unrecognized_keys & model constraints
    const body: Record<string, unknown> = { email };
    if (payload.name && payload.name.trim()) body.name = payload.name.trim();
    if (payload.phone && payload.phone.trim())
      body.phone = payload.phone.trim();
    if (typeof payload.bio === 'string' && payload.bio.trim())
      body.bio = payload.bio.trim();
    if (Array.isArray(payload.links)) {
      const links = payload.links
        .map((l) => (typeof l === 'string' ? l.trim() : ''))
        .filter((l) => !!l);
      if (links.length) body.links = links;
    }
    if (Array.isArray(payload.skills)) {
      const skills = payload.skills
        .filter((s) => s && typeof s.name === 'string' && s.name.trim())
        .map((s) => {
          const o: { name: string; level?: string; years?: number } = {
            name: s.name.trim(),
          };
          if (s.level && s.level.trim()) o.level = s.level.trim();
          if (typeof s.years === 'number' && s.years >= 0) o.years = s.years;
          return o;
        });
      if (skills.length) body.skills = skills;
    }
    if (Array.isArray(payload.qualifications)) {
      const qualifications = payload.qualifications.filter(
        (q) => q && q.title && q.institution && q.year
      );
      if (qualifications.length) body.qualifications = qualifications;
    }
    if (Array.isArray(payload.experience)) {
      const experience = payload.experience.filter(
        (ex) => ex && ex.company && ex.role && ex.duration
      );
      if (experience.length) body.experience = experience;
    }
    return this.exec('Update User By Email (PATCH)', async () => {
      const { data } = await this.client.patch('/users/email', body);
      // If the backend responds with updated user, optionally refresh local stored user basics
      if (data?.email && this.user && this.user.email === data.email) {
        const nextUser: StoredUser = {
          id: data.id || this.user.id,
          name: data.name || this.user.name,
          email: data.email,
          role: data.role || this.user.role,
          phone: data.phone || payload.phone || this.user.phone,
        };
        this.setUser(nextUser);
      }
      return data;
    });
  }

  // User & Task Methods
  async getUserDetails(userId: string) {
    return this.exec('Get User Details', async () => {
      const { data } = await this.client.get(`/users/id/${userId}`);
      return data;
    });
  }

  async getAllUsers() {
    return this.exec('Get All Users', async () => {
      const { data } = await this.client.get('/users');
      return data;
    });
  }

  async getAllTasks() {
    return this.exec('Get All Tasks', async () => {
      const { data } = await this.client.get('/tasks');
      return data;
    });
  }

  // Stats API Methods
  async getAllStats() {
    return this.exec('Get All Stats', async () => {
      const { data } = await this.client.get('/stats/all');
      return data;
    });
  }

  async getUserStats() {
    return this.exec('Get User Stats', async () => {
      const { data } = await this.client.get('/stats/users');
      return data;
    });
  }

  async getTaskStats() {
    return this.exec('Get Task Stats', async () => {
      const { data } = await this.client.get('/stats/tasks');
      return data;
    });
  }

  async getOfferStats() {
    return this.exec('Get Offer Stats', async () => {
      const { data } = await this.client.get('/stats/offers');
      return data;
    });
  }

  async getReviewStats() {
    return this.exec('Get Review Stats', async () => {
      const { data } = await this.client.get('/stats/reviews');
      return data;
    });
  }

  // Chart API Methods
  async getTaskCompletionTrend() {
    return this.exec('Get Task Completion Trend', async () => {
      const { data } = await this.client.get('/charts/task-completion-trend');
      return data;
    });
  }

  async getUserRegistrationTrend() {
    return this.exec('Get User Registration Trend', async () => {
      const { data } = await this.client.get('/charts/user-registration-trend');
      return data;
    });
  }

  async getReviewDistribution() {
    return this.exec('Get Review Distribution', async () => {
      const { data } = await this.client.get('/charts/review-distribution');
      return data;
    });
  }

  // Chat API Methods
  async getChatRequests() {
    return this.exec('Get Chat Requests', async () => {
      const user = this.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching chat requests for user:', user.email);

      const { data } = await this.client.post(
        '/chat/requests',
        {
          email: user.email,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log('Chat Requests Data:', data);

      return data.map((request: any) => ({
        ...request,
        _id: request._id,
        userId: request.userId,
      }));
    });
  }

  async createChatRequest(requestData: {
    receiverId: string;
    task?: string;
    title: string;
    description: string;
    senderId: string;
  }) {
    console.log('Create Request Body:', requestData);
    return this.exec('Create Chat Request', async () => {
      const res = await this.client.post('/chat/requests/add', requestData);
      return res.data;
    });
  }

  async respondToChatRequest(requestId: string, accepted: boolean) {
    return this.exec('Respond to Chat Request', async () => {
      const res = await this.client.post(
        `/chat/requests/${requestId}/respond`,
        {
          action: accepted,
          userId: this.user?.id,
        }
      );
      return res.data;
    });
  }

  async editChatRequest(
    requestId: string,
    requestData: {
      title: string;
      description: string;
      task?: string;
      receiverId: string;
      senderId: string;
    }
  ) {
    return this.exec('Edit Chat Request', async () => {
      const res = await this.client.put(
        `/chat/requests/${requestId}`,
        requestData
      );
      return res.data;
    });
  }

  async deleteChatRequest(requestId: string) {
    return this.exec('Delete Chat Request', async () => {
      const res = await this.client.delete(`/chat/requests/${requestId}`);
      return res.data;
    });
  }

  // Accepts either userId (peer id) or chatId (24-char hex)
  async getChatHistory(id: string) {
    return this.exec('Get Chat History', async () => {
      const res = await this.client.get(`/chat/messages/${id}`);
      const payload = res.data;
      if (payload && Array.isArray(payload.messages)) {
        const msgs = (payload.messages as any[]).map((m: any) => ({
          _id: m._id,
          senderId:
            typeof m.senderId === 'string' ? m.senderId : m.senderId?._id,
          receiverId:
            typeof m.receiverId === 'string' ? m.receiverId : m.receiverId?._id,
          text: m.text || '',
          createdAt: m.createdAt || new Date().toISOString(),
          updatedAt: m.updatedAt || m.createdAt || new Date().toISOString(),
          isEdited: !!m.isEdited,
        }));
        // attach chatId on the array object for the component to pick up
        (msgs as any)._chatId = payload._id || payload.chatId || null;
        return msgs;
      }
      // If API returns a chat doc directly
      if (payload && Array.isArray(payload)) {
        return payload.map((m: any) => ({
          _id: m._id,
          senderId:
            typeof m.senderId === 'string' ? m.senderId : m.senderId?._id,
          receiverId:
            typeof m.receiverId === 'string' ? m.receiverId : m.receiverId?._id,
          text: m.text || '',
          createdAt: m.createdAt || new Date().toISOString(),
          updatedAt: m.updatedAt || m.createdAt || new Date().toISOString(),
          isEdited: !!m.isEdited,
        }));
      }
      return [];
    });
  }

  async getOnlineUsers() {
    return this.exec('Get Online Users', async () => {
      const res = await this.client.get('/chat/sidebar');
      return res.data;
    });
  }

  async sendMessage(
    targetId: string,
    payload: { text?: string; image?: string[] }
  ) {
    return this.exec('Send Message', async () => {
      // targetId can be chatId or userId; backend expects an id (ObjectId)
      const res = await this.client.post(`/chat/send/${targetId}`, payload);
      const chat = res.data;
      // pick the last message from updated chat, ensure it has a valid _id
      const last = Array.isArray(chat?.messages)
        ? chat.messages[chat.messages.length - 1]
        : null;
      if (!last) return null;
      return {
        _id: last._id,
        senderId:
          typeof last.senderId === 'string'
            ? last.senderId
            : last.senderId?._id,
        receiverId:
          typeof last.receiverId === 'string'
            ? last.receiverId
            : last.receiverId?._id,
        text: last.text || '',
        createdAt: last.createdAt || new Date().toISOString(),
        updatedAt: last.updatedAt || last.createdAt || new Date().toISOString(),
        isEdited: !!last.isEdited,
      } as any;
    });
  }

  async editMessage(chatId: string, messageId: string, text: string) {
    return this.exec('Edit Message', async () => {
      const res = await this.client.put(
        `/chat/messages/${chatId}/${messageId}`,
        { text }
      );
      return res.data;
    });
  }

  async deleteMessage(chatId: string, messageId: string) {
    return this.exec('Delete Message', async () => {
      const res = await this.client.delete(
        `/chat/messages/${chatId}/${messageId}`
      );
      return res.data;
    });
  }
}

const apiClient = new APIClient();
export default apiClient;
