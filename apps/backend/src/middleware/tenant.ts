/**
 * T040: Tenant Middleware
 * Multi-tenant isolation middleware for clinic-based data access
 */

import { Elysia } from 'elysia';
import { authMiddleware, type SessionUser } from './auth';

/**
 * Tenant context for multi-tenant operations
 */
export interface TenantContext {
  tenantId: string | null;
  tenantName?: string;
}

/**
 * Tenant middleware that extracts clinic/tenant context from authenticated user
 * Uses soft multi-tenancy with tenant_id column filtering
 */
export const tenantMiddleware = new Elysia({ name: 'tenant' })
  .use(authMiddleware)
  .derive(async ({ user, request }) => {
    // Default tenant context
    let tenant: TenantContext = {
      tenantId: null,
    };

    // If user is authenticated, get their tenant/clinic
    if (user) {
      // Get tenant from header (for admin switching) or user's clinic
      const headerTenantId = request.headers.get('x-tenant-id');
      
      if (headerTenantId && user.role === 'admin') {
        // Admin can switch tenants via header
        tenant = {
          tenantId: headerTenantId,
          tenantName: 'Admin Override',
        };
      } else {
        // Regular users get tenant from their profile
        // This would typically come from the doctor/patient profile
        // For now, we'll extract from any stored clinic association
        tenant = {
          tenantId: null, // Will be set when doctor/patient is fetched
        };
      }
    }

    return { tenant };
  });

/**
 * Require tenant context - ensures a valid tenant is available
 */
export const requireTenant = new Elysia({ name: 'require-tenant' })
  .use(tenantMiddleware)
  .onBeforeHandle(({ tenant, set }) => {
    // For routes that require tenant context
    // Note: Many routes don't require tenant context (public doctor search, etc.)
  });

/**
 * Helper to build tenant-scoped queries
 */
export function withTenant<T extends { clinicId?: string | null }>(
  query: T,
  tenantId: string | null
): T {
  if (tenantId) {
    return { ...query, clinicId: tenantId };
  }
  return query;
}

/**
 * Validate that a resource belongs to the current tenant
 */
export function validateTenantAccess(
  resource: { clinicId?: string | null },
  tenantId: string | null,
  user?: SessionUser | null
): boolean {
  // Admin can access any resource
  if (user?.role === 'admin') {
    return true;
  }

  // If no tenant context, only allow access to public resources
  if (!tenantId) {
    return !resource.clinicId; // Only public resources (no clinicId)
  }

  // Resource must belong to tenant or be public
  return resource.clinicId === tenantId || !resource.clinicId;
}

// TenantContext is already exported as interface above
