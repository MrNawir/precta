/**
 * Database Seed Script
 * Creates sample data for development and testing
 */

import { createDbClient } from './client';
import {
  users,
  patients,
  doctors,
  doctorAvailability,
  clinics,
  articles,
} from './schema';
import { createId } from '@paralleldrive/cuid2';

const db = createDbClient(process.env.DATABASE_URL!);

// Sample data
const sampleClinics = [
  {
    id: createId(),
    name: 'Nairobi Medical Centre',
    slug: 'nairobi-medical-centre',
    description: 'Leading healthcare facility in Nairobi offering comprehensive medical services.',
    city: 'Nairobi',
    region: 'Nairobi County',
    phone: '+254 20 123 4567',
    email: 'info@nairobimedical.co.ke',
  },
  {
    id: createId(),
    name: 'Mombasa Health Clinic',
    slug: 'mombasa-health-clinic',
    description: 'Trusted healthcare provider serving the coastal region.',
    city: 'Mombasa',
    region: 'Mombasa County',
    phone: '+254 41 987 6543',
    email: 'info@mombasahealth.co.ke',
  },
];

const specialties = [
  'General Practice',
  'Pediatrics',
  'Gynecology',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Psychiatry',
  'Dentistry',
];

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create clinics
    console.log('Creating clinics...');
    await db.insert(clinics).values(sampleClinics).onConflictDoNothing();

    // Create admin user
    const adminId = createId();
    console.log('Creating admin user...');
    await db.insert(users).values({
      id: adminId,
      email: 'admin@precta.co.ke',
      passwordHash: '$2b$10$dummyhashedpassword', // Use bcrypt in production
      role: 'admin',
      status: 'active',
      emailVerified: true,
    }).onConflictDoNothing();

    // Create sample doctors
    console.log('Creating sample doctors...');
    const doctorUsers = [];
    const doctorProfiles = [];
    
    const doctorData = [
      { firstName: 'Jane', lastName: 'Wanjiku', specialty: 'General Practice', fee: 1500 },
      { firstName: 'David', lastName: 'Ochieng', specialty: 'Pediatrics', fee: 2000 },
      { firstName: 'Mary', lastName: 'Akinyi', specialty: 'Gynecology', fee: 2500 },
      { firstName: 'Peter', lastName: 'Kamau', specialty: 'Cardiology', fee: 3000 },
      { firstName: 'Grace', lastName: 'Njeri', specialty: 'Dermatology', fee: 2000 },
      { firstName: 'John', lastName: 'Mwangi', specialty: 'Orthopedics', fee: 3500 },
    ];

    for (let i = 0; i < doctorData.length; i++) {
      const doc = doctorData[i];
      const userId = createId();
      const clinicId = sampleClinics[i % 2].id;

      doctorUsers.push({
        id: userId,
        email: `dr.${doc.firstName.toLowerCase()}.${doc.lastName.toLowerCase()}@precta.co.ke`,
        passwordHash: '$2b$10$dummyhashedpassword',
        role: 'doctor' as const,
        status: 'active' as const,
        emailVerified: true,
      });

      doctorProfiles.push({
        id: userId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        bio: `Experienced ${doc.specialty} specialist with over 10 years of practice in Kenya.`,
        specialties: [doc.specialty],
        languages: ['en', 'sw'],
        consultationFee: doc.fee.toString(),
        consultationDurationMinutes: 30,
        consultationModes: ['in_person', 'video'],
        verificationStatus: 'verified' as const,
        verifiedAt: new Date(),
        verifiedBy: adminId,
        clinicId,
        averageRating: (4 + Math.random()).toFixed(1),
        totalReviews: Math.floor(Math.random() * 50) + 10,
        totalConsultations: Math.floor(Math.random() * 200) + 50,
      });
    }

    await db.insert(users).values(doctorUsers).onConflictDoNothing();
    await db.insert(doctors).values(doctorProfiles).onConflictDoNothing();

    // Create doctor availability (Mon-Fri 9am-5pm)
    console.log('Creating doctor availability...');
    const availabilityRecords = [];
    for (const doc of doctorProfiles) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        availabilityRecords.push({
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          consultationMode: 'in_person' as const,
          isActive: true,
        });
        availabilityRecords.push({
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          consultationMode: 'video' as const,
          isActive: true,
        });
      }
    }
    await db.insert(doctorAvailability).values(availabilityRecords).onConflictDoNothing();

    // Create sample patients
    console.log('Creating sample patients...');
    const patientUsers = [];
    const patientProfiles = [];

    const patientData = [
      { firstName: 'Alice', lastName: 'Mutua', gender: 'female' },
      { firstName: 'Bob', lastName: 'Kipchoge', gender: 'male' },
      { firstName: 'Carol', lastName: 'Wambui', gender: 'female' },
    ];

    for (const patient of patientData) {
      const userId = createId();

      patientUsers.push({
        id: userId,
        email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@example.com`,
        phone: `+2547${Math.floor(Math.random() * 90000000) + 10000000}`,
        passwordHash: '$2b$10$dummyhashedpassword',
        role: 'patient' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: true,
      });

      patientProfiles.push({
        id: userId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        gender: patient.gender as 'male' | 'female',
        preferredLanguage: 'en' as const,
        clinicId: sampleClinics[0].id,
      });
    }

    await db.insert(users).values(patientUsers).onConflictDoNothing();
    await db.insert(patients).values(patientProfiles).onConflictDoNothing();

    // Create sample articles
    console.log('Creating sample articles...');
    const articleData = [
      {
        title: 'Understanding Malaria Prevention in Kenya',
        slug: 'malaria-prevention-kenya',
        excerpt: 'Essential tips for protecting yourself and your family from malaria.',
        body: 'Malaria remains one of the leading health concerns in Kenya. Here are key prevention strategies...',
        category: 'prevention' as const,
        tags: ['malaria', 'prevention', 'health'],
        status: 'published' as const,
        publishedAt: new Date(),
        authorId: adminId,
      },
      {
        title: 'Healthy Eating for Kenyan Families',
        slug: 'healthy-eating-kenyan-families',
        excerpt: 'Nutritious meal ideas using locally available ingredients.',
        body: 'A balanced diet is crucial for maintaining good health. In Kenya, we have access to many nutritious foods...',
        category: 'nutrition' as const,
        tags: ['nutrition', 'diet', 'family health'],
        status: 'published' as const,
        publishedAt: new Date(),
        authorId: adminId,
      },
      {
        title: 'Mental Health Awareness: Breaking the Stigma',
        slug: 'mental-health-awareness',
        excerpt: 'Why mental health matters and how to seek help.',
        body: 'Mental health is just as important as physical health. In many communities, there is still stigma around seeking help...',
        category: 'mental_health' as const,
        tags: ['mental health', 'awareness', 'wellness'],
        status: 'published' as const,
        publishedAt: new Date(),
        authorId: adminId,
      },
    ];

    await db.insert(articles).values(articleData).onConflictDoNothing();

    console.log('✅ Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('- Admin: admin@precta.co.ke');
    console.log('- Doctors: dr.jane.wanjiku@precta.co.ke, etc.');
    console.log('- Patients: alice.mutua@example.com, etc.');
    console.log('- Password: (use bcrypt hash in production)');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }

  process.exit(0);
}

seed();
