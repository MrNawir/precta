/**
 * Shared constants for Precta Healthcare Platform
 */

// User roles
export const UserRole = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User status
export const UserStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

// Doctor verification status
export const VerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

// Appointment status
export const AppointmentStatus = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

// Consultation type
export const ConsultationType = {
  IN_PERSON: 'in_person',
  VIDEO: 'video',
} as const;

export type ConsultationTypeValue = (typeof ConsultationType)[keyof typeof ConsultationType];

// Payment status
export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Payment method
export const PaymentMethod = {
  MPESA: 'mpesa',
  CARD: 'card',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Order status
export const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PLACED: 'placed',
  PROCESSING: 'processing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

// Article status
export const ArticleStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ArticleStatusType = (typeof ArticleStatus)[keyof typeof ArticleStatus];

// Article category
export const ArticleCategory = {
  WELLNESS: 'wellness',
  PREVENTION: 'prevention',
  DISEASE: 'disease',
  NUTRITION: 'nutrition',
  MENTAL_HEALTH: 'mental_health',
  FITNESS: 'fitness',
  NEWS: 'news',
} as const;

export type ArticleCategoryType = (typeof ArticleCategory)[keyof typeof ArticleCategory];

// Moderation status
export const ModerationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ModerationStatusType = (typeof ModerationStatus)[keyof typeof ModerationStatus];

// Notification type
export const NotificationType = {
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  PRESCRIPTION_READY: 'prescription_ready',
  ORDER_STATUS: 'order_status',
  VERIFICATION_STATUS: 'verification_status',
  PAYMENT_RECEIVED: 'payment_received',
  GENERAL: 'general',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

// Notification channel
export const NotificationChannel = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
} as const;

export type NotificationChannelType = (typeof NotificationChannel)[keyof typeof NotificationChannel];

// Notification status
export const NotificationStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  READ: 'read',
  FAILED: 'failed',
} as const;

export type NotificationStatusType = (typeof NotificationStatus)[keyof typeof NotificationStatus];

// Gender
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;

export type GenderType = (typeof Gender)[keyof typeof Gender];

// Medical record type
export const MedicalRecordType = {
  PRESCRIPTION: 'prescription',
  LAB_RESULT: 'lab_result',
  IMAGING: 'imaging',
  CONSULTATION_NOTE: 'consultation_note',
  OTHER: 'other',
} as const;

export type MedicalRecordTypeValue = (typeof MedicalRecordType)[keyof typeof MedicalRecordType];

// Credential type
export const CredentialType = {
  LICENSE: 'license',
  DEGREE: 'degree',
  CERTIFICATION: 'certification',
  ID: 'id',
} as const;

export type CredentialTypeValue = (typeof CredentialType)[keyof typeof CredentialType];

// Languages
export const Language = {
  ENGLISH: 'en',
  SWAHILI: 'sw',
} as const;

export type LanguageType = (typeof Language)[keyof typeof Language];

// Currency
export const Currency = {
  KES: 'KES',
} as const;

export type CurrencyType = (typeof Currency)[keyof typeof Currency];

// Payment provider
export const PaymentProvider = {
  PAYSTACK: 'paystack',
} as const;

export type PaymentProviderType = (typeof PaymentProvider)[keyof typeof PaymentProvider];
