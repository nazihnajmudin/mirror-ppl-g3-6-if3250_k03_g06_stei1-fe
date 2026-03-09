export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

export type UserRole =
  | 'PIMPINAN'
  | 'ADMIN_INSTITUSI'
  | 'KAPRODI'
  | 'ADMIN_PRODI'
  | 'DOSEN';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  prodiId?: string;
  isActive: boolean;
  createdAt: string;
}