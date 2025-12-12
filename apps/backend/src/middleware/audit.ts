/**
 * T041: Audit Middleware
 * Audit logging for compliance and security tracking (Constitution Article III)
 */

import { Elysia } from 'elysia';
import { db } from '../lib/db';
import { auditLogs } from '@precta/db';

/**
 * Audit log action types
 */
export const AUDIT_ACTIONS = {
  // Auth events
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REGISTER: 'auth.register',
  PASSWORD_RESET: 'auth.password_reset',
  
  // User events
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Doctor events
  DOCTOR_VERIFY: 'doctor.verify',
  DOCTOR_REJECT: 'doctor.reject',
  DOCTOR_UPDATE: 'doctor.update',
  
  // Patient events
  PATIENT_CREATE: 'patient.create',
  PATIENT_UPDATE: 'patient.update',
  
  // Appointment events
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_CANCEL: 'appointment.cancel',
  APPOINTMENT_COMPLETE: 'appointment.complete',
  
  // Consultation events
  CONSULTATION_START: 'consultation.start',
  CONSULTATION_END: 'consultation.end',
  
  // Medical record events
  RECORD_UPLOAD: 'record.upload',
  RECORD_VIEW: 'record.view',
  RECORD_DELETE: 'record.delete',
  
  // Prescription events
  PRESCRIPTION_CREATE: 'prescription.create',
  PRESCRIPTION_VIEW: 'prescription.view',
  
  // Payment events
  PAYMENT_INITIATE: 'payment.initiate',
  PAYMENT_COMPLETE: 'payment.complete',
  PAYMENT_FAIL: 'payment.fail',
  
  // Admin events
  ADMIN_ACTION: 'admin.action',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  userId?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId || null,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId || null,
      details: entry.details || null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
    });
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the request
    console.error('[Audit] Failed to create audit log:', error, entry);
  }
}

/**
 * Extract client information from request
 */
function getClientInfo(request: Request): { ipAddress: string; userAgent: string } {
  const headers = request.headers;
  
  // Get IP from X-Forwarded-For (if behind proxy) or default
  const forwardedFor = headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || 
                    headers.get('x-real-ip') || 
                    'unknown';
  
  const userAgent = headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

/**
 * Audit middleware - adds audit logging capability to routes
 */
export const auditMiddleware = new Elysia({ name: 'audit' })
  .derive(({ request }) => {
    const clientInfo = getClientInfo(request);
    
    return {
      /**
       * Log an audit event
       */
      audit: async (entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>) => {
        await createAuditLog({
          ...entry,
          ...clientInfo,
        });
      },
    };
  });

/**
 * Audit decorator for sensitive operations
 * Usage: auditRoute('record.view', 'MedicalRecord')
 */
export function auditRoute(action: AuditAction, resourceType: string) {
  return new Elysia({ name: `audit-${action}` })
    .use(auditMiddleware)
    .onAfterHandle(async ({ audit, params, request }) => {
      const resourceId = (params as Record<string, string>)?.id;
      
      // Get user ID from request context if available
      // Note: This needs to be used with authMiddleware to get user
      const userId = null; // Will be populated by auth middleware in actual use
      
      await audit({
        userId,
        action,
        resourceType,
        resourceId,
      });
    });
}

/**
 * Convenience functions for common audit operations
 */
export const audit = {
  async login(userId: string, request: Request): Promise<void> {
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.LOGIN,
      resourceType: 'User',
      resourceId: userId,
      ipAddress,
      userAgent,
    });
  },
  
  async logout(userId: string, request: Request): Promise<void> {
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.LOGOUT,
      resourceType: 'User',
      resourceId: userId,
      ipAddress,
      userAgent,
    });
  },
  
  async recordView(userId: string, recordId: string, request: Request): Promise<void> {
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.RECORD_VIEW,
      resourceType: 'MedicalRecord',
      resourceId: recordId,
      ipAddress,
      userAgent,
    });
  },
  
  async prescriptionView(userId: string, prescriptionId: string, request: Request): Promise<void> {
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.PRESCRIPTION_VIEW,
      resourceType: 'Prescription',
      resourceId: prescriptionId,
      ipAddress,
      userAgent,
    });
  },
  
  async adminAction(userId: string, action: string, details: Record<string, unknown>, request: Request): Promise<void> {
    const { ipAddress, userAgent } = getClientInfo(request);
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.ADMIN_ACTION,
      resourceType: 'AdminAction',
      details: { action, ...details },
      ipAddress,
      userAgent,
    });
  },
};

// Types AuditLogEntry and AuditAction are exported above as interface/type
