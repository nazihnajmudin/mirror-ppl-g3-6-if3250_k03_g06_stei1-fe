import apiClient from '@/lib/api-client';
import { ApiResponse, Prodi, ProdiAssignment, CreatePenugasanInput, User } from '@/types/api.types';

// Prodi API
export const getAllProdi = async (): Promise<Prodi[]> => {
  const response = await apiClient.get<ApiResponse<Prodi[]>>('/prodi');
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

export const addProdiMember = async (payload: { 
  name: string, 
  email: string, 
  role: string,
  password?: string,
}): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/accounts', payload);
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

export const deleteProdiMember = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/accounts/${id}`);
  
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
};

export const addPenugasan = async (payload: CreatePenugasanInput): Promise<ProdiAssignment> => {
  const response = await apiClient.post<ApiResponse<ProdiAssignment>>('/penugasan', payload);
  
  if (response.data.status === 'error') {
    throw new Error(response.data.message);
  }
  
  return response.data.data!;
};