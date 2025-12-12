# Precta - Healthcare Platform for Kenya

A modern telemedicine platform connecting patients with doctors across Kenya. Features video consultations, appointment booking, M-Pesa payments, and health articles.

## Tech Stack

- Runtime: [Bun](https://bun.sh/) - Fast JavaScript runtime
- Backend: [Elysia](https://elysiajs.com/) - TypeScript web framework
- Frontend: [SolidJS](https://www.solidjs.com/) + [SolidStart](https://start.solidjs.com/)
- Database: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- Auth: [Better Auth](https://www.better-auth.com/)
- Styling: [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- Payments: Paystack (M-Pesa integration)
- Video: 100ms
- Search: Typesense

## Project Structure

This project is a monorepo managed by Bun. It's structured into `apps` and `packages`.

- `apps`: Contains the individual applications, such as the web frontend and the backend server.
- `packages`: Contains shared code and utilities that are used across multiple applications.

### Workspaces

- `apps/web`: The SolidJS frontend application.
- `apps/backend`: The ElysiaJS backend server.
- `packages/db`: The Drizzle ORM schema and database utilities.
- `packages/shared`: Shared code and types used by both the frontend and backend.

## Getting Started

To get started with this project, you'll need to have Bun installed. You can find installation instructions on the [official Bun website](https://bun.sh/).

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/precta.git
   cd precta
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   Copy the `.env.example` file to `.env` and fill in the required values.

   ```bash
   cp .env.example .env
   ```

4. **Run the development servers:**

   ```bash
   bun dev
   ```

   This will start both the backend and web development servers in parallel. The web application will be available at `http://localhost:3000` and the backend server at `http://localhost:8080`.
