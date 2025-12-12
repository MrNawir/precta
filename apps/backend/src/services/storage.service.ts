/**
 * T066: Storage Service
 * Business logic for file uploads and management
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { storage, type UploadedFile, type FileCategory, type UploadOptions } from '../lib/storage';
import { createId } from '@paralleldrive/cuid2';

// Note: You'll need to add a files table to the schema
// For now, we'll use in-memory tracking and return upload results

export interface FileMetadata extends UploadedFile {
  userId: string;
  entityType?: string;
  entityId?: string;
  description?: string;
}

export interface UploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
}

class StorageServiceClass {
  /**
   * Upload a single file
   */
  async uploadFile(
    file: File | Blob,
    originalName: string,
    userId: string,
    category: FileCategory,
    options?: {
      entityType?: string;
      entityId?: string;
      description?: string;
    }
  ): Promise<UploadResult> {
    try {
      // Get validation rules for category
      const rules = storage.getValidationRules(category);

      const uploadOptions: UploadOptions = {
        category,
        userId,
        maxSize: rules.maxSize,
        allowedTypes: rules.allowedTypes,
      };

      const uploadedFile = await storage.upload(file, originalName, uploadOptions);

      const metadata: FileMetadata = {
        ...uploadedFile,
        userId,
        entityType: options?.entityType,
        entityId: options?.entityId,
        description: options?.description,
      };

      // TODO: Save metadata to database (files table)
      // await db.insert(files).values({
      //   id: metadata.id,
      //   userId,
      //   category,
      //   originalName: metadata.originalName,
      //   fileName: metadata.fileName,
      //   mimeType: metadata.mimeType,
      //   size: metadata.size,
      //   path: metadata.path,
      //   url: metadata.url,
      //   entityType: options?.entityType,
      //   entityId: options?.entityId,
      //   description: options?.description,
      // });

      return { success: true, file: metadata };
    } catch (error) {
      console.error('[StorageService] Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ file: File | Blob; name: string }>,
    userId: string,
    category: FileCategory,
    options?: {
      entityType?: string;
      entityId?: string;
    }
  ): Promise<{ success: FileMetadata[]; failed: Array<{ name: string; error: string }> }> {
    const results = {
      success: [] as FileMetadata[],
      failed: [] as Array<{ name: string; error: string }>,
    };

    for (const { file, name } of files) {
      const result = await this.uploadFile(file, name, userId, category, options);
      
      if (result.success && result.file) {
        results.success.push(result.file);
      } else {
        results.failed.push({ name, error: result.error || 'Unknown error' });
      }
    }

    return results;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      // TODO: Get file from database and verify ownership
      // const file = await db.select().from(files).where(and(
      //   eq(files.id, fileId),
      //   eq(files.userId, userId)
      // )).limit(1);
      // 
      // if (!file.length) {
      //   throw new Error('File not found');
      // }
      //
      // await storage.delete(file[0].path);
      // await db.delete(files).where(eq(files.id, fileId));

      return true;
    } catch (error) {
      console.error('[StorageService] Delete error:', error);
      return false;
    }
  }

  /**
   * Get files for a user by category
   */
  async getFilesByCategory(userId: string, category: FileCategory): Promise<FileMetadata[]> {
    // TODO: Query from database
    // return db.select().from(files).where(and(
    //   eq(files.userId, userId),
    //   eq(files.category, category)
    // )).orderBy(desc(files.uploadedAt));
    
    return [];
  }

  /**
   * Get files for an entity
   */
  async getFilesByEntity(entityType: string, entityId: string): Promise<FileMetadata[]> {
    // TODO: Query from database
    // return db.select().from(files).where(and(
    //   eq(files.entityType, entityType),
    //   eq(files.entityId, entityId)
    // )).orderBy(desc(files.uploadedAt));
    
    return [];
  }

  /**
   * Upload doctor credentials
   */
  async uploadCredential(
    file: File | Blob,
    originalName: string,
    doctorId: string,
    credentialType: 'license' | 'degree' | 'specialization' | 'id_proof'
  ): Promise<UploadResult> {
    return this.uploadFile(file, originalName, doctorId, 'credentials', {
      entityType: 'doctor_credential',
      entityId: doctorId,
      description: credentialType,
    });
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(
    file: File | Blob,
    originalName: string,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, originalName, userId, 'profile', {
      entityType: 'user_profile',
      entityId: userId,
      description: 'profile_image',
    });
  }

  /**
   * Get signed URL for private files (if using S3)
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the public URL
    return storage.getFileUrl(path);
    
    // TODO: For S3, generate signed URL
    // const command = new GetObjectCommand({
    //   Bucket: S3_BUCKET,
    //   Key: path,
    // });
    // return getSignedUrl(s3Client, command, { expiresIn });
  }
}

export const storageService = new StorageServiceClass();
