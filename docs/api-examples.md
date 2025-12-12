# Precta API Usage Examples

This document provides practical examples for using the Precta Healthcare API.

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.precta.co.ke/api/v1
```

## Authentication

All authenticated endpoints require a session cookie or Bearer token.

### Register User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "patient"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User

```bash
curl http://localhost:3001/api/v1/auth/me \
  -b cookies.txt
```

---

## Doctors

### Search Doctors

```bash
# Basic search
curl "http://localhost:3001/api/v1/doctors"

# With filters
curl "http://localhost:3001/api/v1/doctors?specialty=cardiology&county=nairobi&page=1&limit=10"

# Search by name
curl "http://localhost:3001/api/v1/doctors?q=sarah"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "firstName": "Sarah",
      "lastName": "Kimani",
      "specialties": ["cardiology", "internal_medicine"],
      "consultationFee": "2500.00",
      "averageRating": "4.8",
      "totalReviews": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156
  }
}
```

### Get Doctor Profile

```bash
curl "http://localhost:3001/api/v1/doctors/clx123abc"
```

### Get Doctor Availability

```bash
curl "http://localhost:3001/api/v1/doctors/clx123abc/availability"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "avail123",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "consultationMode": "video"
    }
  ]
}
```

---

## Appointments

### Create Appointment

```bash
curl -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "doctorId": "clx123abc",
    "scheduledAt": "2024-12-20T10:00:00Z",
    "consultationMode": "video",
    "reason": "General checkup"
  }'
```

### List My Appointments

```bash
# As patient
curl "http://localhost:3001/api/v1/appointments?status=upcoming" \
  -b cookies.txt

# As doctor
curl "http://localhost:3001/api/v1/doctors/me/appointments?status=upcoming" \
  -b cookies.txt
```

### Update Appointment Status

```bash
curl -X PATCH http://localhost:3001/api/v1/appointments/apt123 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "confirmed"
  }'
```

---

## Payments

### Initiate Payment (Paystack)

```bash
curl -X POST http://localhost:3001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "appointmentId": "apt123",
    "amount": 2500,
    "currency": "KES",
    "paymentMethod": "card"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/xyz123",
    "access_code": "xyz123",
    "reference": "PRCT_abc123"
  }
}
```

### Verify Payment

```bash
curl "http://localhost:3001/api/v1/payments/verify/PRCT_abc123" \
  -b cookies.txt
```

---

## Consultations

### Start Consultation

```bash
curl -X POST http://localhost:3001/api/v1/consultations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "appointmentId": "apt123"
  }'
```

### Get Consultation Details

```bash
curl "http://localhost:3001/api/v1/consultations/cons123" \
  -b cookies.txt
```

### End Consultation

```bash
curl -X POST http://localhost:3001/api/v1/consultations/cons123/end \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "notes": "Patient reported improved symptoms. Follow up in 2 weeks.",
    "diagnosis": "Mild hypertension"
  }'
```

---

## Prescriptions

### Create Prescription

```bash
curl -X POST http://localhost:3001/api/v1/prescriptions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "consultationId": "cons123",
    "patientId": "pat456",
    "medications": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "once daily",
        "duration": "30 days",
        "instructions": "Take in the morning with food"
      }
    ],
    "notes": "Monitor blood pressure weekly"
  }'
```

### Get Patient Prescriptions

```bash
curl "http://localhost:3001/api/v1/patients/me/prescriptions" \
  -b cookies.txt
```

---

## Medical Records

### Upload Record

```bash
curl -X POST http://localhost:3001/api/v1/records \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "lab_result",
    "title": "Blood Work - CBC",
    "description": "Complete blood count results",
    "fileUrl": "https://storage.precta.co.ke/records/abc123.pdf"
  }'
```

### List Records

```bash
curl "http://localhost:3001/api/v1/patients/me/records?type=lab_result" \
  -b cookies.txt
```

---

## Reviews

### Submit Review

```bash
curl -X POST http://localhost:3001/api/v1/reviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "appointmentId": "apt123",
    "rating": 5,
    "title": "Excellent care",
    "content": "Dr. Kimani was very thorough and took time to explain everything.",
    "isAnonymous": false
  }'
```

### Get Doctor Reviews

```bash
curl "http://localhost:3001/api/v1/reviews/doctor/clx123abc?page=1&limit=10"
```

### Get Rating Summary

```bash
curl "http://localhost:3001/api/v1/reviews/doctor/clx123abc/summary"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalReviews": 42,
    "ratingDistribution": {
      "5": 30,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 0
    }
  }
}
```

---

## Articles

### List Articles

```bash
curl "http://localhost:3001/api/v1/articles?category=wellness&page=1&limit=10"
```

### Get Article

```bash
curl "http://localhost:3001/api/v1/articles/healthy-eating-tips"
```

### Create Article (Admin)

```bash
curl -X POST http://localhost:3001/api/v1/articles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "10 Tips for a Healthy Heart",
    "excerpt": "Simple lifestyle changes to improve heart health",
    "content": "# Healthy Heart Guide\n\n...",
    "category": "wellness",
    "tags": ["heart", "lifestyle", "prevention"],
    "status": "published"
  }'
```

---

## Admin Analytics

### Get Platform Metrics

```bash
curl "http://localhost:3001/api/v1/admin/analytics/metrics" \
  -b cookies.txt
```

### Get Growth Data

```bash
curl "http://localhost:3001/api/v1/admin/analytics/growth?period=month" \
  -b cookies.txt
```

### Get Time Series

```bash
curl "http://localhost:3001/api/v1/admin/analytics/timeseries?metric=revenue&days=30" \
  -b cookies.txt
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `UNAUTHORIZED` - Not logged in
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `PAYMENT_FAILED` - Payment processing failed

---

## Rate Limits

- **General**: 100 requests/minute per IP
- **Auth endpoints**: 10 requests/minute per IP
- **Payment endpoints**: 20 requests/minute per user

---

## SDKs

Coming soon:
- JavaScript/TypeScript SDK
- Swift SDK (iOS)
- Kotlin SDK (Android)
