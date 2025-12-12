/**
 * API Client for Precta Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profileImageUrl: string | null;
  specialties: string[];
  languages: string[];
  consultationFee: string;
  consultationDurationMinutes: number;
  consultationModes: string[];
  verificationStatus: string;
  averageRating: string;
  totalReviews: number;
  totalConsultations: number;
}

export async function fetchDoctors(params?: {
  specialty?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Doctor[]>> {
  const searchParams = new URLSearchParams();
  if (params?.specialty) searchParams.set('specialty', params.specialty);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${API_URL}/api/v1/doctors?${searchParams.toString()}`;
  const response = await fetch(url);
  return response.json();
}

export async function fetchDoctor(id: string): Promise<ApiResponse<Doctor>> {
  const response = await fetch(`${API_URL}/api/v1/doctors/${id}`);
  return response.json();
}

export async function fetchDoctorAvailability(id: string) {
  const response = await fetch(`${API_URL}/api/v1/doctors/${id}/availability`);
  return response.json();
}

export { type Doctor };
