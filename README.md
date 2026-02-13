# ACSI School Mentor Platform

A mentoring platform for ACSI schools in Kenya, enabling mentors to conduct health check assessments and create action plans.

## Features

- 🔐 Role-based authentication (Mentor, School Admin, ACSI Admin)
- 📊 School health check assessments (6 domains)
- 📋 Action plan generation with templates
- 📝 Mentor notes and school tracking
- 📄 Professional PDF export with charts
- 🎨 Clean, responsive UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **PDF Generation**: pdf-lib, Chart.js
- **Styling**: CSS Modules (easily replaceable with Tailwind)

## Project Structure

```
acsi-school-mentor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth layout group
│   │   │   └── login/
│   │   ├── (dashboard)/       # Main app layout group
│   │   │   ├── mentor/
│   │   │   ├── school-admin/
│   │   │   ├── admin/
│   │   │   └── schools/[id]/
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and config
│   │   ├── supabase/         # Supabase client & types
│   │   ├── auth/             # Auth helpers
│   │   ├── config/           # Health check & plan templates
│   │   └── pdf/              # PDF generation
│   └── types/                # TypeScript types
├── public/                    # Static assets (logo, etc.)
└── supabase/                  # Database schema & migrations
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. Copy your project credentials

### 3. Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run development server
npm run dev
```

### 4. Create Your First Admin User

After running the schema, create your admin account:

```sql
-- In Supabase SQL Editor, after signing up via the app:
UPDATE public.profiles 
SET role = 'acsi_admin'
WHERE email = 'your-email@example.com';
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_NAME=ACSI School Mentor
```

## Key Features

### Health Check Assessment
- 6 domains: Leadership, Teaching, Governance, Child Protection, Finance, Spiritual
- 1-5 scoring system with qualitative notes
- Historical tracking

### Action Plans
- Auto-generated templates based on assessment scores
- Customizable action items with owners and KPIs
- Progress tracking

### PDF Export
- Professional reports with charts and branding
- School overview, assessment results, action plans
- Mentor notes inclusion

## Database Schema Overview

- `profiles` - User accounts with roles
- `schools` - School information
- `school_members` - User-school relationships
- `assessments` - Health check assessments
- `action_plans` - School improvement plans
- `action_items` - Individual plan tasks
- `mentor_notes` - Mentor observations

## Future Enhancements

- [ ] Offline capability with local DB sync
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] File upload for evidence

## License

Proprietary - ACSI Kenya
