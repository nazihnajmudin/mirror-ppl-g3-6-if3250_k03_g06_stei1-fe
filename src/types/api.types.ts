export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PIMPINAN'
  | 'KAPRODI'
  | 'TIM_PRODI';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  prodiId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prodi {
  id: string;
  fullname: string;
  abbreviation?: string;
  degree?: string;
  accreditation?: AccreditationInfo;
  createdAt: string;
  updatedAt: string;
}

export interface AccreditationInfo {
  id: string;
  prodiId: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProdiAssignment {
  id: string;
  userId: string;
  prodiId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  prodi: {
    id: string;
    fullname: string;
    abbreviation?: string;
  };
}

export interface CreatePenugasanInput {
  userId: string;
  prodiId: string;
  kriteriaIds: string[];
}