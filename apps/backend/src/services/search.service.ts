/**
 * T047: Search Service
 * Typesense search operations and indexing
 */

import { getTypesenseClient, COLLECTIONS, doctorCollectionSchema, articleCollectionSchema } from '../lib/typesense';
import { db } from '../lib/db';
import { doctors, articles, clinics } from '@precta/db';
import { eq } from 'drizzle-orm';

export interface SearchResult<T> {
  hits: Array<{
    document: T;
    highlight?: Record<string, { snippet: string }>;
    text_match: number;
  }>;
  found: number;
  page: number;
  search_time_ms: number;
  facet_counts?: Array<{
    field_name: string;
    counts: Array<{ value: string; count: number }>;
  }>;
}

export interface DoctorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialties: string[];
  bio?: string;
  languages: string[];
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
  isAvailableToday: boolean;
}

class SearchService {
  /**
   * Initialize Typesense collections
   */
  async initializeCollections(): Promise<void> {
    const client = getTypesenseClient();

    const collections = [
      { name: COLLECTIONS.DOCTORS, schema: doctorCollectionSchema },
      { name: COLLECTIONS.ARTICLES, schema: articleCollectionSchema },
    ];

    for (const { name, schema } of collections) {
      try {
        await client.collections(name).retrieve();
        console.log(`[Search] Collection '${name}' exists`);
      } catch (error: unknown) {
        if ((error as { httpStatus?: number })?.httpStatus === 404) {
          await client.collections().create(schema);
          console.log(`[Search] Collection '${name}' created`);
        }
      }
    }
  }

  /**
   * Search doctors
   */
  async searchDoctors(params: {
    query?: string;
    specialty?: string;
    city?: string;
    consultationMode?: string;
    minRating?: number;
    maxFee?: number;
    language?: string;
    page?: number;
    perPage?: number;
  }): Promise<SearchResult<DoctorSearchResult>> {
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
    if (params.language) {
      filterBy.push(`languages:=[${params.language}]`);
    }

    try {
      const result = await client.collections(COLLECTIONS.DOCTORS).documents().search({
        q: params.query || '*',
        query_by: 'fullName,specialties,bio',
        filter_by: filterBy.join(' && '),
        sort_by: 'averageRating:desc,totalReviews:desc',
        page: params.page || 1,
        per_page: params.perPage || 20,
        facet_by: 'specialties,city,consultationModes,languages',
        highlight_full_fields: 'fullName,bio',
      });

      return {
        hits: (result.hits || []).map((hit) => ({
          document: hit.document as DoctorSearchResult,
          highlight: hit.highlight as Record<string, { snippet: string }>,
          text_match: hit.text_match || 0,
        })),
        found: result.found || 0,
        page: result.page || 1,
        search_time_ms: result.search_time_ms || 0,
        facet_counts: result.facet_counts?.map((facet) => ({
          field_name: facet.field_name,
          counts: facet.counts.map((c) => ({ value: c.value, count: c.count })),
        })),
      };
    } catch (error) {
      console.error('[Search] Doctor search error:', error);
      return { hits: [], found: 0, page: 1, search_time_ms: 0 };
    }
  }

  /**
   * Search articles
   */
  async searchArticles(params: {
    query?: string;
    category?: string;
    tag?: string;
    page?: number;
    perPage?: number;
  }): Promise<SearchResult<{ id: string; title: string; slug: string; excerpt?: string }>> {
    const client = getTypesenseClient();

    const filterBy: string[] = ['status:=published'];

    if (params.category) {
      filterBy.push(`category:=${params.category}`);
    }
    if (params.tag) {
      filterBy.push(`tags:=[${params.tag}]`);
    }

    try {
      const result = await client.collections(COLLECTIONS.ARTICLES).documents().search({
        q: params.query || '*',
        query_by: 'title,excerpt,body',
        filter_by: filterBy.join(' && '),
        sort_by: 'publishedAt:desc',
        page: params.page || 1,
        per_page: params.perPage || 20,
        facet_by: 'category,tags',
      });

      return {
        hits: (result.hits || []).map((hit) => ({
          document: hit.document as { id: string; title: string; slug: string; excerpt?: string },
          text_match: hit.text_match || 0,
        })),
        found: result.found || 0,
        page: result.page || 1,
        search_time_ms: result.search_time_ms || 0,
      };
    } catch (error) {
      console.error('[Search] Article search error:', error);
      return { hits: [], found: 0, page: 1, search_time_ms: 0 };
    }
  }

  /**
   * Index a doctor document
   */
  async indexDoctor(doctorId: string): Promise<void> {
    const client = getTypesenseClient();

    // Fetch doctor with clinic info
    const result = await db
      .select({
        doctor: doctors,
        clinic: clinics,
      })
      .from(doctors)
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!result.length) {
      console.warn(`[Search] Doctor ${doctorId} not found for indexing`);
      return;
    }

    const { doctor, clinic } = result[0];

    if (doctor.verificationStatus !== 'verified') {
      console.log(`[Search] Doctor ${doctorId} not verified, skipping indexing`);
      return;
    }

    const document = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: `${doctor.firstName} ${doctor.lastName}`,
      specialties: doctor.specialties || [],
      bio: doctor.bio || '',
      languages: doctor.languages || ['en'],
      consultationFee: parseFloat(doctor.consultationFee),
      consultationModes: doctor.consultationModes || ['in_person'],
      averageRating: parseFloat(doctor.averageRating || '0'),
      totalReviews: doctor.totalReviews,
      totalConsultations: doctor.totalConsultations,
      yearsOfExperience: doctor.yearsOfExperience || 0,
      clinicId: doctor.clinicId || '',
      clinicName: clinic?.name || '',
      city: clinic?.city || '',
      verificationStatus: doctor.verificationStatus,
      isAvailableToday: true, // TODO: Calculate based on availability
      createdAt: doctor.createdAt.getTime(),
    };

    try {
      await client.collections(COLLECTIONS.DOCTORS).documents().upsert(document);
      console.log(`[Search] Indexed doctor: ${doctor.id}`);
    } catch (error) {
      console.error(`[Search] Error indexing doctor ${doctor.id}:`, error);
    }
  }

  /**
   * Remove doctor from index
   */
  async removeDoctor(doctorId: string): Promise<void> {
    const client = getTypesenseClient();

    try {
      await client.collections(COLLECTIONS.DOCTORS).documents(doctorId).delete();
      console.log(`[Search] Removed doctor from index: ${doctorId}`);
    } catch (error) {
      console.error(`[Search] Error removing doctor ${doctorId}:`, error);
    }
  }

  /**
   * Reindex all verified doctors
   */
  async reindexAllDoctors(): Promise<{ indexed: number; errors: number }> {
    const allDoctors = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.verificationStatus, 'verified'));

    let indexed = 0;
    let errors = 0;

    for (const doctor of allDoctors) {
      try {
        await this.indexDoctor(doctor.id);
        indexed++;
      } catch {
        errors++;
      }
    }

    console.log(`[Search] Reindexed ${indexed} doctors, ${errors} errors`);
    return { indexed, errors };
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string, collection: 'doctors' | 'articles' = 'doctors'): Promise<string[]> {
    const client = getTypesenseClient();
    const collectionName = collection === 'doctors' ? COLLECTIONS.DOCTORS : COLLECTIONS.ARTICLES;
    const queryBy = collection === 'doctors' ? 'fullName,specialties' : 'title';

    try {
      const result = await client.collections(collectionName).documents().search({
        q: query,
        query_by: queryBy,
        per_page: 5,
        prefix: true,
      });

      if (collection === 'doctors') {
        return (result.hits || []).map((hit) => {
          const doc = hit.document as DoctorSearchResult;
          return doc.fullName;
        });
      } else {
        return (result.hits || []).map((hit) => {
          const doc = hit.document as { title: string };
          return doc.title;
        });
      }
    } catch (error) {
      console.error('[Search] Suggestion error:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
