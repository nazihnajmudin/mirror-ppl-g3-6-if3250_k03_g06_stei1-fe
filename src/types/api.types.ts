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
  name: string;
  email: string;
  role: UserRole;
  prodiId: string | null;
  prodi: {
    id: string;
    fullname: string;
  } | null;
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
  certificateOriginalName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProdiAssignment {
  id: string;
  userId: string;
  prodiId: string;
  kriteria?: string[];
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
  kriteria?: string[];
}

export interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  prodiId: string | null;
}

export interface ProdiOption {
  id: string;
  fullname: string;
  abbreviation: string | null;
  degree: string | null;
}

export interface DashboardData {
  prodi: {
    id: string;
    fullname: string;
    abbreviation: string | null;
    degree: string | null;
  };
  accreditation: {
    grade: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  documents: {
    lkps: {
      status: string;
      progress: number;
    };
    led: {
      status: string;
      progress: number;
    };
  };
  simulationScore: number;
  lamTemplate: 'LAM_TEKNIK' | 'INFOKOM';
  criteria: Array<{
    id: string;
    code: string;
    name: string;
    progress: number;
    subsections: Array<{
      id: string;
      name: string;
      progress: number;
    }>;
  }>;
  criticalIndicators: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
  accessInfo?: {
    canEdit: boolean;
    canAccess: boolean;
    role: string;
    isReadOnly: boolean;
  };
}
