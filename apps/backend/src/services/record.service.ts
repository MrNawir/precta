/**
 * T087: Record Service
 * Medical records management and secure file storage
 */

import { eq, and, desc, sql, or } from 'drizzle-orm';
import { db } from '../lib/db';
import { medicalRecords, appointments } from '@precta/db';
import { storage, type FileCategory } from '../lib/storage';
import { createId } from '@paralleldrive/cuid2';

export type RecordType = 'lab_result' | 'prescription' | 'imaging' | 'vaccination' | 'medical_history' | 'other';

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: RecordType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  filePath: string | null;
  mimeType: string | null;
  fileSize: number | null;
  recordDate: Date;
  uploadedAt: Date;
  sharedWith: string[];
  metadata: Record<string, unknown> | null;
}

export interface CreateRecordInput {
  patientId: string;
  type: RecordType;
  title: string;
  description?: string;
  recordDate?: Date;
  metadata?: Record<string, unknown>;
}

class RecordService {
  /**
   * Upload a medical record with file
   */
  async uploadRecord(
    file: File | Blob,
    fileName: string,
    data: CreateRecordInput
  ): Promise<MedicalRecord> {
    // Upload file
    const uploadResult = await storage.upload(file, fileName, {
      category: 'documents' as FileCategory,
      userId: data.patientId,
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    });

    // Create record
    const recordId = createId();
    const now = new Date();

    await db.insert(medicalRecords).values({
      id: recordId,
      patientId: data.patientId,
      recordType: data.type,
      title: data.title,
      description: data.description || null,
      fileUrl: uploadResult.url,
      filePath: uploadResult.path,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.size,
      recordDate: data.recordDate || now,
      metadata: data.metadata || null,
    });

    return {
      id: recordId,
      patientId: data.patientId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      fileUrl: uploadResult.url,
      filePath: uploadResult.path,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.size,
      recordDate: data.recordDate || now,
      uploadedAt: now,
      sharedWith: [],
      metadata: data.metadata || null,
    };
  }

  /**
   * Create a record without file (e.g., manual entry)
   */
  async createRecord(data: CreateRecordInput): Promise<MedicalRecord> {
    const recordId = createId();
    const now = new Date();

    await db.insert(medicalRecords).values({
      id: recordId,
      patientId: data.patientId,
      recordType: data.type,
      title: data.title,
      description: data.description || null,
      recordDate: data.recordDate || now,
      metadata: data.metadata || null,
    });

    return {
      id: recordId,
      patientId: data.patientId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      fileUrl: null,
      filePath: null,
      mimeType: null,
      fileSize: null,
      recordDate: data.recordDate || now,
      uploadedAt: now,
      sharedWith: [],
      metadata: data.metadata || null,
    };
  }

  /**
   * Get records for a patient
   */
  async getPatientRecords(
    patientId: string,
    options?: {
      type?: RecordType;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: MedicalRecord[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(medicalRecords.patientId, patientId)];
    if (options?.type) {
      conditions.push(eq(medicalRecords.recordType, options.type));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicalRecords)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const records = await db
      .select()
      .from(medicalRecords)
      .where(and(...conditions))
      .orderBy(desc(medicalRecords.recordDate))
      .limit(limit)
      .offset(offset);

    return {
      data: records.map(this.mapToRecord),
      total,
    };
  }

  /**
   * Get a single record
   */
  async getRecord(recordId: string, userId: string): Promise<MedicalRecord | null> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, recordId))
      .limit(1);

    if (!record) return null;

    // Check access
    const hasAccess = await this.checkRecordAccess(record, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return this.mapToRecord(record);
  }

  /**
   * Check if user has access to a record
   */
  private async checkRecordAccess(
    record: typeof medicalRecords.$inferSelect,
    userId: string
  ): Promise<boolean> {
    // Patient always has access to their own records
    if (record.patientId === userId) return true;

    // Check if user is a doctor with an appointment with this patient
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, userId),
        eq(appointments.patientId, record.patientId),
        or(
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'in_progress')
        )
      ))
      .limit(1);

    if (appointment) return true;

    // Check sharedWith list
    const sharedWith = record.sharedWith as string[] || [];
    return sharedWith.includes(userId);
  }

  /**
   * Share record with a doctor
   */
  async shareRecord(recordId: string, patientId: string, doctorId: string): Promise<boolean> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(and(
        eq(medicalRecords.id, recordId),
        eq(medicalRecords.patientId, patientId)
      ))
      .limit(1);

    if (!record) {
      throw new Error('Record not found');
    }

    const sharedWith = record.sharedWith as string[] || [];
    if (!sharedWith.includes(doctorId)) {
      sharedWith.push(doctorId);
      
      await db
        .update(medicalRecords)
        .set({ sharedWith })
        .where(eq(medicalRecords.id, recordId));
    }

    return true;
  }

  /**
   * Revoke record access from a doctor
   */
  async revokeRecordAccess(recordId: string, patientId: string, doctorId: string): Promise<boolean> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(and(
        eq(medicalRecords.id, recordId),
        eq(medicalRecords.patientId, patientId)
      ))
      .limit(1);

    if (!record) {
      throw new Error('Record not found');
    }

    const sharedWith = (record.sharedWith as string[] || []).filter(id => id !== doctorId);
    
    await db
      .update(medicalRecords)
      .set({ sharedWith })
      .where(eq(medicalRecords.id, recordId));

    return true;
  }

  /**
   * Delete a record
   */
  async deleteRecord(recordId: string, patientId: string): Promise<boolean> {
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(and(
        eq(medicalRecords.id, recordId),
        eq(medicalRecords.patientId, patientId)
      ))
      .limit(1);

    if (!record) {
      throw new Error('Record not found');
    }

    // Delete file if exists
    if (record.filePath) {
      await storage.delete(record.filePath);
    }

    // Delete record
    await db
      .delete(medicalRecords)
      .where(eq(medicalRecords.id, recordId));

    return true;
  }

  /**
   * Get records accessible by a doctor for a specific patient
   */
  async getDoctorAccessibleRecords(
    doctorId: string,
    patientId: string
  ): Promise<MedicalRecord[]> {
    // Verify doctor has an active appointment with patient
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.patientId, patientId),
        or(
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'in_progress')
        )
      ))
      .limit(1);

    if (!appointment) {
      return [];
    }

    // Get all patient records
    const records = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.recordDate));

    return records.map(this.mapToRecord);
  }

  /**
   * Map database record to MedicalRecord type
   */
  private mapToRecord(record: typeof medicalRecords.$inferSelect): MedicalRecord {
    return {
      id: record.id,
      patientId: record.patientId,
      type: record.recordType as RecordType,
      title: record.title,
      description: record.description,
      fileUrl: record.fileUrl,
      filePath: record.filePath,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      recordDate: record.recordDate,
      uploadedAt: record.createdAt,
      sharedWith: record.sharedWith as string[] || [],
      metadata: record.metadata as Record<string, unknown> | null,
    };
  }
}

export const recordService = new RecordService();
