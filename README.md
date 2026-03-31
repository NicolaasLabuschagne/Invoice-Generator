# Service Quote & Invoice SaaS

A production-ready SaaS web application built with Next.js, Supabase, and Prisma for managing service assignments, generating itemized quotes, and exporting professional PDF invoices.

## 🚀 Features

- **Authentication**: Secure login/signup with Supabase Auth and automatic Profile sync.
- **Client Management**: Full CRM to manage your customer database with data isolation.
- **Job/Event Tracking**: Track service jobs with automatic cost calculation (`quantity * hours * rate`).
- **Quote Generator**: Create itemized quotes from service jobs with automatic numbering (Q-0001).
- **Invoice System**: Convert quotes to invoices or create them manually with status tracking (INV-0001).
- **PDF Export**: Generate professional, itemized PDFs for quotes and invoices using `@react-pdf/renderer`.
- **Dashboard**: Real-time overview of total revenue, outstanding invoices, and recent business activity.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [React-PDF](https://react-pdf.org/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- A Supabase Project ([Create one here](https://supabase.com/dashboard))

### 1. Clone the repository

```bash
git clone https://github.com/NicolaasLabuschagne/Invoice-Generator.git
cd Invoice-Generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following variables from your Supabase project settings:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database (Connection strings from Supabase Transaction Pooling)
DATABASE_URL="postgres://postgres.your-project-id:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.your-project-id:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### 4. Database Setup

Initialize your database schema using Prisma:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

The app is ready to be deployed on [Vercel](https://vercel.com/):

1. Connect your repository to Vercel.
2. Add the environment variables listed above to the Vercel project settings.
3. Vercel will automatically detect Next.js and deploy the app.

## 🔒 Security

- All data is scoped to the `userId` of the authenticated user.
- Middleware ensures that only authenticated users can access the dashboard and API routes.
- Prisma relations enforce data integrity between clients, jobs, quotes, and invoices.
