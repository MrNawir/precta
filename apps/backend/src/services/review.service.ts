/**
 * T135: Review Service
 * Doctor reviews and ratings management
 */

import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { db } from '../lib/db';
import { reviews, appointments, doctors, users } from '@precta/db';
import { createId } from '@paralleldrive/cuid2';

export interface Review {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  rating: number;
  title: string | null;
  content: string;
  isAnonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  patient?: {
    name: string;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  appointmentId: string;
  patientId: string;
  rating: number;
  title?: string;
  content: string;
  isAnonymous?: boolean;
}

export interface DoctorRatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

class ReviewService {
  /**
   * Create a new review
   */
  async create(input: CreateReviewInput): Promise<Review> {
    // Verify appointment exists and is completed
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.id, input.appointmentId),
        eq(appointments.patientId, input.patientId),
        eq(appointments.status, 'completed')
      ))
      .limit(1);

    if (!appointment) {
      throw new Error('Cannot review: appointment not found or not completed');
    }

    // Check if already reviewed
    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.appointmentId, input.appointmentId))
      .limit(1);

    if (existing) {
      throw new Error('You have already reviewed this appointment');
    }

    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const reviewId = createId();

    await db.insert(reviews).values({
      id: reviewId,
      appointmentId: input.appointmentId,
      doctorId: appointment.doctorId,
      patientId: input.patientId,
      rating: input.rating,
      title: input.title || null,
      content: input.content,
      isAnonymous: input.isAnonymous ?? false,
      status: 'approved', // Auto-approve for now, can add moderation later
    });

    // Update doctor's average rating
    await this.updateDoctorRating(appointment.doctorId);

    return this.getById(reviewId) as Promise<Review>;
  }

  /**
   * Get review by ID
   */
  async getById(reviewId: string): Promise<Review | null> {
    const [result] = await db
      .select({
        review: reviews,
        patient: {
          name: users.name,
          image: users.image,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.patientId, users.id))
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!result) return null;

    return this.mapToReview(result.review, result.patient);
  }

  /**
   * Get reviews for a doctor
   */
  async getByDoctorId(
    doctorId: string,
    options?: {
      status?: 'pending' | 'approved' | 'rejected';
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Review[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 10, 50);
    const offset = (page - 1) * limit;

    const conditions = [eq(reviews.doctorId, doctorId)];
    if (options?.status) {
      conditions.push(eq(reviews.status, options.status));
    } else {
      // Default to approved only
      conditions.push(eq(reviews.status, 'approved'));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);

    const results = await db
      .select({
        review: reviews,
        patient: {
          name: users.name,
          image: users.image,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.patientId, users.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => this.mapToReview(r.review, r.patient)),
      total,
    };
  }

  /**
   * Get rating summary for a doctor
   */
  async getDoctorRatingSummary(doctorId: string): Promise<DoctorRatingSummary> {
    const [avgResult] = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(and(
        eq(reviews.doctorId, doctorId),
        eq(reviews.status, 'approved')
      ));

    // Get distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    for (let rating = 1; rating <= 5; rating++) {
      const [result] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(reviews)
        .where(and(
          eq(reviews.doctorId, doctorId),
          eq(reviews.status, 'approved'),
          eq(reviews.rating, rating)
        ));
      distribution[rating as keyof typeof distribution] = Number(result?.count || 0);
    }

    return {
      averageRating: Math.round((Number(avgResult?.avg) || 0) * 10) / 10,
      totalReviews: Number(avgResult?.count || 0),
      ratingDistribution: distribution,
    };
  }

  /**
   * Update a review (for moderation)
   */
  async moderate(
    reviewId: string,
    status: 'approved' | 'rejected',
    moderationNote?: string
  ): Promise<Review> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) {
      throw new Error('Review not found');
    }

    await db
      .update(reviews)
      .set({
        status,
        moderationNote,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    // Update doctor's rating after moderation
    await this.updateDoctorRating(review.doctorId);

    return this.getById(reviewId) as Promise<Review>;
  }

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Review[]; total: number }> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 50);
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));

    const total = Number(countResult?.count || 0);

    const results = await db
      .select({
        review: reviews,
        patient: {
          name: users.name,
          image: users.image,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.patientId, users.id))
      .where(eq(reviews.status, 'pending'))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(r => this.mapToReview(r.review, r.patient)),
      total,
    };
  }

  /**
   * Delete a review
   */
  async delete(reviewId: string): Promise<boolean> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) return false;

    await db.delete(reviews).where(eq(reviews.id, reviewId));
    
    // Update doctor's rating
    await this.updateDoctorRating(review.doctorId);

    return true;
  }

  /**
   * Update doctor's average rating in their profile
   */
  private async updateDoctorRating(doctorId: string): Promise<void> {
    const [result] = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(and(
        eq(reviews.doctorId, doctorId),
        eq(reviews.status, 'approved')
      ));

    await db
      .update(doctors)
      .set({
        rating: Math.round((Number(result?.avg) || 0) * 10) / 10,
        reviewCount: Number(result?.count || 0),
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, doctorId));
  }

  /**
   * Map database review to Review type
   */
  private mapToReview(
    review: typeof reviews.$inferSelect,
    patient: { name: string | null; image: string | null } | null
  ): Review {
    return {
      id: review.id,
      appointmentId: review.appointmentId,
      doctorId: review.doctorId,
      patientId: review.patientId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      isAnonymous: review.isAnonymous,
      status: review.status as 'pending' | 'approved' | 'rejected',
      moderationNote: review.moderationNote || undefined,
      patient: review.isAnonymous ? undefined : (patient ? {
        name: patient.name || 'Patient',
        image: patient.image,
      } : undefined),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

export const reviewService = new ReviewService();
