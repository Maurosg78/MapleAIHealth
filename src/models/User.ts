export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  specialty?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  settings?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
} 