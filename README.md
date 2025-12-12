# Precta - Healthcare Platform for Kenya 🇰🇪

A modern telemedicine platform connecting patients with doctors across Kenya. Features video consultations, appointment booking, M-Pesa payments, and health articles.

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Backend**: [Elysia](https://elysiajs.com/) - TypeScript web framework
- **Frontend**: [SolidJS](https://www.solidjs.com/) + [SolidStart](https://start.solidjs.com/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Payments**: Paystack (M-Pesa integration)
- **Video**: 100ms
- **Search**: Typesense

## 📁 Project Structure

```
precta/
├── apps/
│   ├── backend/          # Elysia API server
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   └── lib/      # Utilities
│   │   └── package.json
│   └── web/              # SolidStart frontend
│       ├── src/
│       │   ├── routes/   # File-based routing
│       │   └── components/
│       └── package.json
├── packages/
│   ├── db/               # Drizzle schema & migrations
│   └── shared/           # Shared types & utilities
└── specs/                # Feature specifications
```

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- PostgreSQL >= 14
- Redis (optional, for caching)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/precta.git
cd precta
bun install
```

### 2. Environment Setup

Create `.env` files in each app:

```bash
# apps/backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/precta
BETTER_AUTH_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=your-paystack-key
CORS_ORIGIN=http://localhost:3000

# apps/web/.env
VITE_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
# Generate migrations
cd packages/db
bun run generate

# Run migrations
bun run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/backend
bun run dev

# Terminal 2 - Frontend
cd apps/web
bun run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🧪 Running Tests

```bash
# Unit tests
bun test

# E2E tests (Playwright)
cd apps/web
bun run test:e2e
```

## 📝 API Documentation

API documentation is available at:
- Swagger UI: http://localhost:3001/swagger
- OpenAPI spec: http://localhost:3001/swagger/json

## 🔑 Key Features

### For Patients
- 🔍 Search doctors by specialty, location, availability
- 📅 Book in-person or video consultations
- 💳 Pay via M-Pesa or card (Paystack)
- 📱 Video consultations from anywhere
- 📋 Access medical records and prescriptions
- ⭐ Rate and review doctors

### For Doctors
- 👨‍⚕️ Professional profile management
- 📆 Availability scheduling
- 💰 Earnings dashboard with M-Pesa payouts
- 📹 Conduct video consultations
- 📝 Digital prescriptions

### For Admins
- 📊 Platform analytics
- 👥 User management
- 🔍 Content moderation
- 📰 Health article publishing

## 🌍 Kenya-Specific Features

- M-Pesa payment integration
- County-based location filtering
- Swahili language support (planned)
- Low-bandwidth optimizations
- Offline-first PWA support

## 📄 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
