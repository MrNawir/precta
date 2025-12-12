/**
 * T038: Typesense Search Client
 * Full-text search for doctors, articles, and other content
 */

import Typesense from 'typesense';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

let typesenseClient: Typesense.Client | null = null;

/**
 * Get or create Typesense client
 */
export function getTypesenseClient(): Typesense.Client {
  if (!typesenseClient) {
    const host = process.env.TYPESENSE_HOST || 'localhost';
    const port = parseInt(process.env.TYPESENSE_PORT || '8108', 10);
    const apiKey = process.env.TYPESENSE_API_KEY || 'precta_dev_api_key';
    const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
    
    typesenseClient = new Typesense.Client({
      nodes: [{ host, port, protocol }],
      apiKey,
      connectionTimeoutSeconds: 5,
      retryIntervalSeconds: 0.5,
      numRetries: 3,
    });
  }
  
  return typesenseClient;
}

// Collection schemas
export const COLLECTIONS = {
  DOCTORS: 'doctors',
  ARTICLES: 'articles',
} as const;

/**
 * Doctor collection schema for search
 */
export const doctorCollectionSchema: CollectionCreateSchema = {
  name: COLLECTIONS.DOCTORS,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'firstName', type: 'string' },
    { name: 'lastName', type: 'string' },
    { name: 'fullName', type: 'string' }, // Computed: firstName + lastName
    { name: 'specialties', type: 'string[]', facet: true },
    { name: 'bio', type: 'string', optional: true },
    { name: 'languages', type: 'string[]', facet: true },
    { name: 'consultationFee', type: 'float', facet: true },
    { name: 'consultationModes', type: 'string[]', facet: true },
    { name: 'averageRating', type: 'float', sort: true },
    { name: 'totalReviews', type: 'int32', sort: true },
    { name: 'totalConsultations', type: 'int32', sort: true },
    { name: 'yearsOfExperience', type: 'int32', optional: true },
    { name: 'clinicId', type: 'string', optional: true, facet: true },
    { name: 'clinicName', type: 'string', optional: true },
    { name: 'city', type: 'string', optional: true, facet: true },
    { name: 'verificationStatus', type: 'string', facet: true },
    { name: 'isAvailableToday', type: 'bool', facet: true },
    { name: 'createdAt', type: 'int64', sort: true },
  ],
  default_sorting_field: 'averageRating',
};

/**
 * Article collection schema for search
 */
export const articleCollectionSchema: CollectionCreateSchema = {
  name: COLLECTIONS.ARTICLES,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'excerpt', type: 'string', optional: true },
    { name: 'body', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'authorName', type: 'string', optional: true },
    { name: 'status', type: 'string', facet: true },
    { name: 'viewCount', type: 'int32', sort: true },
    { name: 'publishedAt', type: 'int64', sort: true, optional: true },
    { name: 'createdAt', type: 'int64', sort: true },
  ],
  default_sorting_field: 'publishedAt',
};

/**
 * Initialize collections (create if not exists)
 */
export async function initializeCollections(): Promise<void> {
  const client = getTypesenseClient();
  
  const schemas = [doctorCollectionSchema, articleCollectionSchema];
  
  for (const schema of schemas) {
    try {
      await client.collections(schema.name).retrieve();
      console.log(`[Typesense] Collection '${schema.name}' already exists`);
    } catch (error: unknown) {
      if ((error as { httpStatus?: number })?.httpStatus === 404) {
        await client.collections().create(schema);
        console.log(`[Typesense] Collection '${schema.name}' created`);
      } else {
        console.error(`[Typesense] Error with collection '${schema.name}':`, error);
      }
    }
  }
}

/**
 * Search helpers
 */
export const search = {
  /**
   * Search doctors
   */
  async doctors(params: {
    query: string;
    specialty?: string;
    city?: string;
    consultationMode?: string;
    minRating?: number;
    maxFee?: number;
    page?: number;
    perPage?: number;
  }) {
    const client = getTypesenseClient();
    
    const filterBy: string[] = ['verificationStatus:=verified'];
    
    if (params.specialty) {
      filterBy.push(`specialties:=[${params.specialty}]`);
    }
    if (params.city) {
      filterBy.push(`city:=${params.city}`);
    }
    if (params.consultationMode) {
      filterBy.push(`consultationModes:=[${params.consultationMode}]`);
    }
    if (params.minRating) {
      filterBy.push(`averageRating:>=${params.minRating}`);
    }
    if (params.maxFee) {
      filterBy.push(`consultationFee:<=${params.maxFee}`);
    }
    
    try {
      const results = await client.collections(COLLECTIONS.DOCTORS).documents().search({
        q: params.query || '*',
        query_by: 'fullName,specialties,bio',
        filter_by: filterBy.join(' && '),
        sort_by: 'averageRating:desc,totalReviews:desc',
        page: params.page || 1,
        per_page: params.perPage || 20,
        facet_by: 'specialties,city,consultationModes',
      });
      
      return results;
    } catch (error) {
      console.error('[Typesense] Doctor search error:', error);
      return { hits: [], found: 0 };
    }
  },
  
  /**
   * Search articles
   */
  async articles(params: {
    query: string;
    category?: string;
    tag?: string;
    page?: number;
    perPage?: number;
  }) {
    const client = getTypesenseClient();
    
    const filterBy: string[] = ['status:=published'];
    
    if (params.category) {
      filterBy.push(`category:=${params.category}`);
    }
    if (params.tag) {
      filterBy.push(`tags:=[${params.tag}]`);
    }
    
    try {
      const results = await client.collections(COLLECTIONS.ARTICLES).documents().search({
        q: params.query || '*',
        query_by: 'title,excerpt,body',
        filter_by: filterBy.join(' && '),
        sort_by: 'publishedAt:desc',
        page: params.page || 1,
        per_page: params.perPage || 20,
        facet_by: 'category,tags',
      });
      
      return results;
    } catch (error) {
      console.error('[Typesense] Article search error:', error);
      return { hits: [], found: 0 };
    }
  },
};

/**
 * Index helpers
 */
export const index = {
  /**
   * Index a doctor document
   */
  async doctor(doc: {
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
    bio?: string;
    languages?: string[];
    consultationFee: number;
    consultationModes: string[];
    averageRating: number;
    totalReviews: number;
    totalConsultations: number;
    yearsOfExperience?: number;
    clinicId?: string;
    clinicName?: string;
    city?: string;
    verificationStatus: string;
    isAvailableToday?: boolean;
    createdAt: Date;
  }) {
    const client = getTypesenseClient();
    
    const document = {
      ...doc,
      fullName: `${doc.firstName} ${doc.lastName}`,
      createdAt: doc.createdAt.getTime(),
      isAvailableToday: doc.isAvailableToday ?? false,
    };
    
    try {
      await client.collections(COLLECTIONS.DOCTORS).documents().upsert(document);
      console.log(`[Typesense] Indexed doctor: ${doc.id}`);
    } catch (error) {
      console.error('[Typesense] Error indexing doctor:', error);
    }
  },
  
  /**
   * Remove a doctor from index
   */
  async removeDoctor(id: string) {
    const client = getTypesenseClient();
    
    try {
      await client.collections(COLLECTIONS.DOCTORS).documents(id).delete();
      console.log(`[Typesense] Removed doctor from index: ${id}`);
    } catch (error) {
      console.error('[Typesense] Error removing doctor:', error);
    }
  },
  
  /**
   * Index an article document
   */
  async article(doc: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    body: string;
    category: string;
    tags?: string[];
    authorName?: string;
    status: string;
    viewCount: number;
    publishedAt?: Date;
    createdAt: Date;
  }) {
    const client = getTypesenseClient();
    
    const document = {
      ...doc,
      tags: doc.tags || [],
      publishedAt: doc.publishedAt?.getTime() || 0,
      createdAt: doc.createdAt.getTime(),
    };
    
    try {
      await client.collections(COLLECTIONS.ARTICLES).documents().upsert(document);
      console.log(`[Typesense] Indexed article: ${doc.id}`);
    } catch (error) {
      console.error('[Typesense] Error indexing article:', error);
    }
  },
};

export default { getTypesenseClient, initializeCollections, search, index };
