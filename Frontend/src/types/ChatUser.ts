export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  profileImage?: string;
}
