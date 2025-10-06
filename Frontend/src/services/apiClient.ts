import axios, { type AxiosInstance } from 'axios';

interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

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

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (r) => r,
      async (error) => {
        if (error.response?.status === 401) {
          this.logout();
          // optional: redirect logic can be added here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth helpers
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

  getStoredUser(): StoredUser | null {
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
  }

  // Backend calls (adjust endpoints to match backend when available)
  async login(payload: { email: string; password: string }) {
    console.log('Login payload:', payload);
    try {
        const { data } = await this.client.post('/auth/login', payload);
        if (data?.token) this.setToken(data.token);
        if (data?.user) this.setUser(data.user);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
  }

  async signup(payload: { name: string; email: string; password: string; phone?: string }) {
    payload.phone = payload.phone || '1234567890';
    console.log('Signup payload:', payload);
    try{
        const { data } = await this.client.post('/auth/register', payload);
        console.log('Signup response data:', data);
        if (data?.token) this.setToken(data.token);
        if (data?.user) this.setUser(data.user);
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
  }

  async forgotPassword(payload: { email: string }) {
    const { data } = await this.client.post('/auth/forgot-password', payload);
    return data;
  }

  async resetPassword(token: string, payload: { password: string }) {
    const { data } = await this.client.post(
      `/auth/reset-password/${token}`,
      payload
    );
    return data;
  }

  async verifyToken() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // Example chat call placeholder
  async getSidebarUsers() {
    const { data } = await this.client.get('/chat/sidebar');
    return data;
  }
}

const apiClient = new APIClient();
export default apiClient;
