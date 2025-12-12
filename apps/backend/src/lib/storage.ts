/**
 * T071: Storage Abstraction
 * File storage for uploads (local + S3/R2 compatible)
 */

import { createId } from '@paralleldrive/cuid2';
import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

export type StorageProvider = 'local' | 's3';
export type FileCategory = 'credentials' | 'profile' | 'documents' | 'prescriptions';

const STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider;
const STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH || './uploads';
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const CDN_URL = process.env.CDN_URL || '';

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  path: string;
  url: string;
  uploadedAt: Date;
}

export interface UploadOptions {
  category: FileCategory;
  userId: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

class StorageService {
  private provider: StorageProvider;
  private basePath: string;

  constructor() {
    this.provider = STORAGE_PROVIDER;
    this.basePath = STORAGE_BASE_PATH;
  }

  /**
   * Upload a file
   */
  async upload(
    file: File | Blob,
    originalName: string,
    options: UploadOptions
  ): Promise<UploadedFile> {
    // Validate file
    const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate unique filename
    const fileId = createId();
    const ext = extname(originalName) || this.getExtFromMime(file.type);
    const fileName = `${fileId}${ext}`;
    const relativePath = `${options.category}/${options.userId}/${fileName}`;

    // Upload based on provider
    if (this.provider === 's3') {
      await this.uploadToS3(file, relativePath);
    } else {
      await this.uploadToLocal(file, relativePath);
    }

    const url = this.getFileUrl(relativePath);

    return {
      id: fileId,
      originalName,
      fileName,
      mimeType: file.type,
      size: file.size,
      category: options.category,
      path: relativePath,
      url,
      uploadedAt: new Date(),
    };
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(file: File | Blob, relativePath: string): Promise<void> {
    const fullPath = join(this.basePath, relativePath);
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

    // Ensure directory exists
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);
  }

  /**
   * Upload to S3-compatible storage
   */
  private async uploadToS3(file: File | Blob, relativePath: string): Promise<void> {
    // Using native fetch for S3 upload (AWS Signature V4)
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${relativePath}`;

    // For production, use AWS SDK or implement proper S3 signing
    // This is a simplified example
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': buffer.length.toString(),
        // Add AWS auth headers here
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }
  }

  /**
   * Delete a file
   */
  async delete(relativePath: string): Promise<void> {
    if (this.provider === 's3') {
      await this.deleteFromS3(relativePath);
    } else {
      await this.deleteFromLocal(relativePath);
    }
  }

  private async deleteFromLocal(relativePath: string): Promise<void> {
    const fullPath = join(this.basePath, relativePath);
    try {
      await unlink(fullPath);
    } catch (error) {
      console.error(`Failed to delete file: ${fullPath}`, error);
    }
  }

  private async deleteFromS3(relativePath: string): Promise<void> {
    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${relativePath}`;
    
    await fetch(url, {
      method: 'DELETE',
      // Add AWS auth headers here
    });
  }

  /**
   * Get file URL
   */
  getFileUrl(relativePath: string): string {
    if (CDN_URL) {
      return `${CDN_URL}/${relativePath}`;
    }

    if (this.provider === 's3') {
      return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${relativePath}`;
    }

    // Local URL
    return `/uploads/${relativePath}`;
  }

  /**
   * Read file (for local storage)
   */
  async readFile(relativePath: string): Promise<Buffer> {
    if (this.provider === 's3') {
      const url = this.getFileUrl(relativePath);
      const response = await fetch(url);
      return Buffer.from(await response.arrayBuffer());
    }

    const fullPath = join(this.basePath, relativePath);
    return readFile(fullPath);
  }

  /**
   * Check if file exists
   */
  async exists(relativePath: string): Promise<boolean> {
    if (this.provider === 's3') {
      const url = this.getFileUrl(relativePath);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    }

    const fullPath = join(this.basePath, relativePath);
    return existsSync(fullPath);
  }

  /**
   * Get file extension from MIME type
   */
  private getExtFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };
    return mimeToExt[mimeType] || '';
  }

  /**
   * Validate file type based on category
   */
  getValidationRules(category: FileCategory): { maxSize: number; allowedTypes: string[] } {
    const rules: Record<FileCategory, { maxSize: number; allowedTypes: string[] }> = {
      credentials: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      },
      profile: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
      documents: {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      },
      prescriptions: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      },
    };
    return rules[category];
  }
}

export const storage = new StorageService();
export default storage;
