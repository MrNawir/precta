/**
 * Export all database schemas
 * Schemas will be added as they are created
 */

// Users and roles
export * from './users';

// Patient profiles
export * from './patients';

// Doctor profiles, availability, credentials
export * from './doctors';

// Clinics (tenants)
export * from './clinics';

// Appointments and consultations
export * from './appointments';
export * from './consultations';

// Prescriptions
export * from './prescriptions';

// Medical records
export * from './records';

// Orders and order items
export * from './orders';

// Payments
export * from './payments';

// Articles
export * from './articles';

// Reviews
export * from './reviews';

// Notifications
export * from './notifications';

// Audit logs
export * from './audit';
