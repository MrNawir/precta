/**
 * Shared type definitions
 */

import type {
  UserRoleType,
  UserStatusType,
  VerificationStatusType,
  AppointmentStatusType,
  ConsultationTypeValue,
  PaymentStatusType,
  PaymentMethodType,
  OrderStatusType,
  ArticleStatusType,
  ArticleCategoryType,
  ModerationStatusType,
  NotificationTypeValue,
  NotificationChannelType,
  NotificationStatusType,
  GenderType,
  MedicalRecordTypeValue,
  CredentialTypeValue,
  LanguageType,
} from '../constants/index';

// Base entity type with common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search params
export interface SearchParams extends PaginationParams {
  q?: string;
  filters?: Record<string, unknown>;
}

// User related types
export interface UserBase {
  id: string;
  email: string;
  phone?: string;
  role: UserRoleType;
  status: UserStatusType;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session user (minimal info for auth context)
export interface SessionUser {
  id: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  clinicId?: string;
}

// Medication type for prescriptions
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Operating hours
export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

// Qualifications for doctors
export interface Qualification {
  type: 'degree' | 'certification' | 'specialization';
  name: string;
  institution: string;
  year: number;
}

// Clinic settings
export interface ClinicSettings {
  allowOnlineBooking: boolean;
  appointmentBuffer: number; // minutes between appointments
  maxAdvanceBookingDays: number;
  cancellationPolicy?: string;
}

// Search filters for doctors
export interface DoctorSearchFilters {
  specialty?: string;
  city?: string;
  minRating?: number;
  maxFee?: number;
  consultationType?: ConsultationTypeValue;
  availableNow?: boolean;
  language?: LanguageType;
}

// Typesense document types
export interface DoctorSearchDocument {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialties: string[];
  bio?: string;
  city?: string;
  clinicName?: string;
  consultationFee: number;
  consultationModes: string[];
  languages: string[];
  averageRating: number;
  totalReviews: number;
  yearsOfExperience?: number;
  profileImageUrl?: string;
  verificationStatus: VerificationStatusType;
}

export interface ArticleSearchDocument {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: ArticleCategoryType;
  tags: string[];
  authorName: string;
  publishedAt: number;
  viewCount: number;
}
