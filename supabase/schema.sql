-- ACSI School Mentor Platform - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('mentor', 'school_admin', 'acsi_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- SCHOOLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    county TEXT,
    town TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    head_teacher TEXT,
    student_count INTEGER,
    staff_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schools they have access to" ON public.schools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = schools.id 
            AND school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'acsi_admin'
        )
    );

-- =====================================================
-- SCHOOL MEMBERS (User-School Relationships)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.school_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('mentor', 'school_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their school memberships" ON public.school_members
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'acsi_admin'
    ));

-- =====================================================
-- ASSESSMENTS (Health Checks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    conducted_by UUID NOT NULL REFERENCES public.profiles(id),
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
    responses JSONB NOT NULL DEFAULT '{}',
    overall_score DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments for their schools" ON public.assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = assessments.school_id 
            AND school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'acsi_admin'
        )
    );

CREATE POLICY "Mentors can insert assessments" ON public.assessments
    FOR INSERT WITH CHECK (
        conducted_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = assessments.school_id 
            AND school_members.user_id = auth.uid()
            AND school_members.role = 'mentor'
        )
    );

CREATE POLICY "Mentors can update their assessments" ON public.assessments
    FOR UPDATE USING (conducted_by = auth.uid());

-- =====================================================
-- ACTION PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view action plans for their schools" ON public.action_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = action_plans.school_id 
            AND school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'acsi_admin'
        )
    );

CREATE POLICY "Mentors can create action plans" ON public.action_plans
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = action_plans.school_id 
            AND school_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Mentors can update action plans" ON public.action_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = action_plans.school_id 
            AND school_members.user_id = auth.uid()
        )
    );

-- =====================================================
-- ACTION ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    description TEXT NOT NULL,
    owner_name TEXT,
    kpi TEXT,
    priority INTEGER CHECK (priority IN (1, 2, 3)),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    due_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view action items for their schools" ON public.action_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.action_plans 
            JOIN public.school_members ON action_plans.school_id = school_members.school_id
            WHERE action_plans.id = action_items.plan_id 
            AND school_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage action items" ON public.action_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.action_plans 
            JOIN public.school_members ON action_plans.school_id = school_members.school_id
            WHERE action_plans.id = action_items.plan_id 
            AND school_members.user_id = auth.uid()
        )
    );

-- =====================================================
-- MENTOR NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mentor_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id),
    visit_date DATE,
    note_type TEXT CHECK (note_type IN ('visit', 'phone_call', 'observation', 'other')),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view notes for their schools" ON public.mentor_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = mentor_notes.school_id 
            AND school_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'acsi_admin'
        )
    );

CREATE POLICY "Mentors can create notes" ON public.mentor_notes
    FOR INSERT WITH CHECK (
        mentor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.school_members 
            WHERE school_members.school_id = mentor_notes.school_id 
            AND school_members.user_id = auth.uid()
            AND school_members.role = 'mentor'
        )
    );

CREATE POLICY "Mentors can update their own notes" ON public.mentor_notes
    FOR UPDATE USING (mentor_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'school_admin')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON public.action_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_mentor_notes_updated_at BEFORE UPDATE ON public.mentor_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_school_members_user ON public.school_members(user_id);
CREATE INDEX IF NOT EXISTS idx_school_members_school ON public.school_members(school_id);
CREATE INDEX IF NOT EXISTS idx_assessments_school ON public.assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON public.assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_action_plans_school ON public.action_plans(school_id);
CREATE INDEX IF NOT EXISTS idx_action_items_plan ON public.action_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_school ON public.mentor_notes(school_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_mentor ON public.mentor_notes(mentor_id);

-- =====================================================
-- SAMPLE DATA (optional - remove in production)
-- =====================================================
-- This will be empty initially. 
-- After you create your first user via signup, run:
-- UPDATE public.profiles SET role = 'acsi_admin' WHERE email = 'your-email@example.com';
