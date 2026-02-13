# ACSI School Mentor - Setup & Deployment Guide

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd acsi-school-mentor
npm install
```

### 2. Setup Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy the entire contents of `supabase/schema.sql`
5. Paste it into the SQL Editor and click **RUN**

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_NAME=ACSI School Mentor
```

**Where to find these keys:**
- Go to your Supabase project
- Click on **Settings** (gear icon) → **API**
- Copy:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### 5. Create Your Admin Account

1. Go to http://localhost:3000/login
2. Since there's no signup page yet, you need to create a user manually in Supabase:
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Click **Add user** → **Create new user**
   - Enter email and password
   - Click **Create user**

3. Make yourself admin:
   - Go to **SQL Editor**
   - Run this query (replace with your email):
   
   ```sql
   UPDATE public.profiles 
   SET role = 'acsi_admin'
   WHERE email = 'your-email@example.com';
   ```

4. Now you can login at http://localhost:3000/login

## 📊 Features Overview

### For Mentors
- View assigned schools
- Conduct health check assessments (6 domains)
- Generate action plans automatically
- Export professional PDF reports
- Add mentor notes

### For School Admins
- View their school's data
- See assessment history
- Track action plan progress

### For ACSI Admins
- Manage all schools
- Manage users and roles
- Invite new mentors and school admins
- View platform statistics
- Assign mentors to schools

## 🏗️ Project Structure

```
acsi-school-mentor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Login pages
│   │   ├── (dashboard)/       # Main app pages
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── mentor/       # Mentor dashboard
│   │   │   ├── school-admin/ # School admin pages
│   │   │   └── schools/[id]/ # School detail & assessment
│   │   └── api/              # API routes (future)
│   ├── components/            # Reusable React components
│   │   ├── Navigation.tsx    # Main navigation bar
│   │   ├── AssessmentForm.tsx # Health check form
│   │   ├── ActionPlanGenerator.tsx
│   │   └── ScorePills.tsx    # 1-5 scoring widget
│   ├── lib/                   # Utilities & config
│   │   ├── supabase/         # Supabase clients
│   │   ├── auth.ts           # Auth helpers
│   │   ├── config/           # App configuration
│   │   │   ├── healthCheckConfig.ts  # Assessment domains
│   │   │   └── planTemplates.ts      # Action plan templates
│   │   └── pdf/              # PDF generation
│   └── types/                # TypeScript types
├── supabase/
│   └── schema.sql            # Database schema
└── public/                    # Static assets
```

## 🔧 Customizing the Health Check

The health check questions are easily customizable. Edit:

`src/lib/config/healthCheckConfig.ts`

```typescript
export const HEALTH_CHECK_DOMAINS: Domain[] = [
  {
    code: 'LEADERSHIP',
    label: 'Leadership & Management',
    questions: [
      {
        id: 'ld_vision',
        text: 'Your question here...',
      },
      // Add more questions
    ],
  },
  // Add more domains
]
```

## 📄 Customizing Action Plan Templates

Edit `src/lib/config/planTemplates.ts` to change the suggested actions for each domain.

## 🎨 Adding Your Logo

1. Add your logo file to `public/logo.png`
2. Update the header in `src/components/Navigation.tsx`
3. Update the PDF header in `src/lib/pdf/pdfGenerator.ts`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables from `.env.local`
6. Click **Deploy**

### Deploy to other platforms

The app works on any Node.js hosting platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🔐 Security Notes

- **Never commit** `.env.local` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- Row Level Security (RLS) is enabled in the database
- All routes are protected by middleware

## 📝 Database Migrations

If you need to modify the database schema:

1. Make changes in `supabase/schema.sql`
2. Create a new migration file
3. Run it in Supabase SQL Editor

## 🐛 Troubleshooting

### "Error: Invalid auth credentials"
- Check your `.env.local` file
- Make sure you copied the correct keys from Supabase
- Restart your dev server after changing env vars

### "Cannot find module '@supabase/ssr'"
```bash
npm install @supabase/ssr
```

### "Database query failed"
- Make sure you ran the `schema.sql` in Supabase
- Check RLS policies are enabled
- Verify your user has the correct role in the `profiles` table

### Login loop / redirect issues
- Clear browser cookies
- Check middleware configuration
- Verify user has correct role in database

## 📧 Support

For issues or questions, contact your development team or create an issue in the repository.

## 🎯 Next Steps

1. **Test the app** - Create a test school and run through the assessment flow
2. **Add your logo** - Replace the branding
3. **Customize content** - Update health check questions based on your training materials
4. **Invite users** - Add mentors and school admins
5. **Deploy** - Put it live on Vercel

---

Built with ❤️ for ACSI Kenya
