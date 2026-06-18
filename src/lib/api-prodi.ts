import apiClient from '@/lib/api-client';
import { ApiResponse, Prodi, ProdiAssignment, CreatePenugasanInput, User, AccreditationInfo, CurrentUser } from '@/types/api.types';

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await apiClient.get<ApiResponse<CurrentUser>>('/auth/me');
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const getAllProdi = async (): Promise<Prodi[]> => {
  const response = await apiClient.get<ApiResponse<Prodi[]>>('/prodi');
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data || [];
};

export const getMyProdi = async (): Promise<Prodi[]> => {
  const response = await apiClient.get<ApiResponse<Prodi[]>>('/prodi/my-prodi');
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data || [];
};

export const getProdiById = async (id: string): Promise<Prodi> => {
  const response = await apiClient.get<ApiResponse<Prodi>>(`/prodi/${id}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const updateProdi = async (id: string, data: { fullname?: string; degree?: string; abbreviation?: string }): Promise<Prodi> => {
  const response = await apiClient.put<ApiResponse<Prodi>>(`/prodi/${id}`, data);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const getAccreditation = async (prodiId: string): Promise<AccreditationInfo | null> => {
  const response = await apiClient.get<ApiResponse<AccreditationInfo | null>>(`/prodi/${prodiId}/accreditation`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data ?? null;
};

export const upsertAccreditation = async (prodiId: string, data: { grade?: string; certificateUrl?: string; startDate?: string; endDate?: string }): Promise<AccreditationInfo> => {
  const response = await apiClient.put<ApiResponse<AccreditationInfo>>(`/prodi/${prodiId}/accreditation`, data);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const uploadAccreditationCertificate = async (prodiId: string, file: File): Promise<AccreditationInfo> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<ApiResponse<AccreditationInfo>>(
    `/prodi/${prodiId}/accreditation/certificate`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const downloadCertificate = async (prodiId: string, filename?: string): Promise<void> => {
  const response = await apiClient.get(`/prodi/${prodiId}/accreditation/certificate`, { responseType: 'blob' });
  const contentType = String(response.headers['content-type'] ?? 'application/octet-stream');
  const url = URL.createObjectURL(new Blob([response.data], { type: contentType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? 'sertifikat';
  a.click();
  URL.revokeObjectURL(url);
};

export const isLocalCertificate = (certificateUrl?: string | null): boolean =>
  !!certificateUrl && !certificateUrl.startsWith('http');

export const addProdiMember = async (payload: {
  name: string;
  email: string;
  role: string;
  password?: string;
  prodiId: string;
}): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/accounts', payload);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const getProdiMembers = async (prodiId: string): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>(`/accounts?prodiId=${prodiId}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data || [];
};

export const deleteProdiMember = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/accounts/${id}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
};

export const getPenugasan = async (prodiId: string): Promise<ProdiAssignment[]> => {
  const response = await apiClient.get<ApiResponse<ProdiAssignment[]>>(`/penugasan?prodiId=${prodiId}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data || [];
};

export const addPenugasan = async (payload: CreatePenugasanInput): Promise<ProdiAssignment> => {
  const response = await apiClient.post<ApiResponse<ProdiAssignment>>('/penugasan', payload);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const deletePenugasan = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/penugasan/${id}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
};

export interface SimulationIndicator {
  code: string;
  name: string;
  quantitativeScore: number;
  qualitativeScore: number | null;
  qualitativeNote?: string | null;
  totalScore: number;
  evidenceCount: number;
  sheetCompletion: number;
}

export interface SimulationScore {
  prodiId: string;
  indicators: SimulationIndicator[];
  quantitativeScore: number;
  qualitativeScore: number;
  totalScore: number;
  updatedAt: string;
}

export const getSimulationScore = async (prodiId: string): Promise<SimulationScore> => {
  const response = await apiClient.get<ApiResponse<SimulationScore>>(`/simulasi-skor/${prodiId}`);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const updateSimulationQualitative = async (
  prodiId: string,
  qualitativeScores: Array<{ code: string; qualitativeScore?: number; qualitativeNote?: string | null }>
): Promise<SimulationScore> => {
  const response = await apiClient.put<ApiResponse<SimulationScore>>(`/simulasi-skor/${prodiId}/qualitative`, {
    qualitativeScores,
  });
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};