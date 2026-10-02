-- ====================================================================
-- GODSPEED HQ — SUPABASE PRODUCTION DATABASE SCHEMA & INITIALIZATION
-- Run this complete SQL script in your Supabase SQL Editor:
-- Project URL: https://beetwyqytgqnytofuwoh.supabase.co
-- ====================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'member',
    rank TEXT DEFAULT 'Director',
    office_id TEXT,
    office_name TEXT DEFAULT 'Global HQ — London',
    status TEXT DEFAULT 'ACTIVE',
    avatar_url TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    pv_total NUMERIC DEFAULT 0,
    earnings_ytd NUMERIC DEFAULT 0,
    health_score NUMERIC DEFAULT 100,
    downline_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'member',
    rank TEXT DEFAULT 'Director',
    office_id TEXT,
    office_name TEXT DEFAULT 'Global HQ — London',
    status TEXT DEFAULT 'ACTIVE',
    avatar_url TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    pv_total NUMERIC DEFAULT 0,
    earnings_ytd NUMERIC DEFAULT 0,
    health_score NUMERIC DEFAULT 100,
    downline_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE OFFICES TABLE
CREATE TABLE IF NOT EXISTS public.offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    member_count INT DEFAULT 0,
    attendance_rate NUMERIC DEFAULT 0,
    dues_collected NUMERIC DEFAULT 0,
    total_pv NUMERIC DEFAULT 0,
    performance_score NUMERIC DEFAULT 100,
    manager_name TEXT,
    established_year INT DEFAULT 2024,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE PV SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.pv_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT,
    member_name TEXT NOT NULL,
    office_name TEXT DEFAULT 'Global HQ — London',
    pv_amount NUMERIC NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    product_category TEXT NOT NULL,
    receipt_ref TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    approver_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE DUES TABLE
CREATE TABLE IF NOT EXISTS public.dues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT,
    member_name TEXT NOT NULL,
    office_name TEXT DEFAULT 'Global HQ — London',
    month_year TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT,
    member_name TEXT NOT NULL,
    office_id TEXT,
    office_name TEXT DEFAULT 'Global HQ — London',
    date DATE DEFAULT CURRENT_DATE,
    check_in_time TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT,
    member_name TEXT NOT NULL,
    period TEXT NOT NULL,
    base_commission NUMERIC DEFAULT 0,
    volume_bonus NUMERIC DEFAULT 0,
    leadership_override NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CREATE HEALTH SCORES TABLE
CREATE TABLE IF NOT EXISTS public.health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT,
    member_name TEXT NOT NULL,
    vitality_score NUMERIC DEFAULT 90,
    activity_index NUMERIC DEFAULT 90,
    retention_risk TEXT DEFAULT 'LOW',
    engagement_grade TEXT DEFAULT 'A+',
    last_assessment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CREATE ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pv_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated Permissive Access Policies for Dashboard
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Write Profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public Write Members" ON public.members FOR ALL USING (true);

CREATE POLICY "Public Read Offices" ON public.offices FOR SELECT USING (true);
CREATE POLICY "Public Write Offices" ON public.offices FOR ALL USING (true);

CREATE POLICY "Public Read PV Submissions" ON public.pv_submissions FOR SELECT USING (true);
CREATE POLICY "Public Write PV Submissions" ON public.pv_submissions FOR ALL USING (true);

CREATE POLICY "Public Read Dues" ON public.dues FOR SELECT USING (true);
CREATE POLICY "Public Write Dues" ON public.dues FOR ALL USING (true);

CREATE POLICY "Public Read Attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Public Write Attendance" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Public Read Earnings" ON public.earnings FOR SELECT USING (true);
CREATE POLICY "Public Write Earnings" ON public.earnings FOR ALL USING (true);

CREATE POLICY "Public Read Health Scores" ON public.health_scores FOR SELECT USING (true);
CREATE POLICY "Public Write Health Scores" ON public.health_scores FOR ALL USING (true);

CREATE POLICY "Public Read Activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Public Write Activities" ON public.activities FOR ALL USING (true);

CREATE POLICY "Public Read Notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON public.notifications FOR ALL USING (true);

-- ====================================================================
-- AUTOMATIC USER REGISTRATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, rank)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'business_status', 'Director')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- INITIAL SEED DATA FOR GODSPEED HQ
-- ====================================================================

-- Seed Offices
INSERT INTO public.offices (name, code, location, city, country, member_count, attendance_rate, dues_collected, total_pv, performance_score, manager_name, established_year)
VALUES
('Global HQ — London', 'LON-01', 'Mayfair Executive Tower', 'London', 'United Kingdom', 420, 94.2, 124500, 342000, 98, 'Eleanor Sterling', 2019),
('Americas Hub — New York', 'NYC-01', '730 5th Avenue, Manhattan', 'New York', 'United States', 380, 91.8, 98400, 289000, 95, 'David K. Ross', 2020),
('APAC Region — Singapore', 'SGP-01', 'Marina Bay Financial Centre', 'Singapore', 'Singapore', 290, 96.5, 87200, 265000, 96, 'Mei Ling Tan', 2021),
('EMEA Hub — Zurich', 'ZRH-01', 'Bahnhofstrasse 45', 'Zurich', 'Switzerland', 158, 89.4, 45000, 178000, 92, 'Adrian von Berg', 2022)
ON CONFLICT DO NOTHING;

-- Seed Members
INSERT INTO public.members (member_id, full_name, email, phone, role, rank, office_name, status, pv_total, earnings_ytd, health_score, downline_count)
VALUES
('GSD-9901', 'Marcus Vance', 'm.vance@godspeedhq.com', '+1 (555) 382-9901', 'super_admin', 'Director', 'Global HQ — London', 'ACTIVE', 14850, 184500, 94, 342),
('GSD-8802', 'Eleanor Sterling', 'e.sterling@godspeedhq.com', '+44 20 7946 0912', 'regional_manager', 'Executive Manager', 'Global HQ — London', 'ACTIVE', 9200, 96500, 91, 128),
('GSD-7703', 'David K. Ross', 'd.ross@godspeedhq.com', '+1 212 555 0192', 'regional_manager', 'Senior Manager', 'Americas Hub — New York', 'ACTIVE', 8400, 84200, 88, 94),
('GSD-6604', 'Sophia Chen', 's.chen@godspeedhq.com', '+65 6789 0123', 'member', 'Manager', 'APAC Region — Singapore', 'ACTIVE', 5100, 48900, 85, 42),
('GSD-5505', 'Alexander Wright', 'a.wright@godspeedhq.com', '+44 20 7946 0881', 'member', 'Distributors', 'Global HQ — London', 'ACTIVE', 4800, 42300, 90, 36),
('GSD-4406', 'Beatrice Lawson', 'b.lawson@godspeedhq.com', '+1 212 555 0451', 'member', 'PRO', 'Americas Hub — New York', 'PENDING', 1250, 12400, 76, 12)
ON CONFLICT DO NOTHING;

-- Seed PV Submissions
INSERT INTO public.pv_submissions (member_name, office_name, pv_amount, submission_date, product_category, receipt_ref, status, approver_note)
VALUES
('Sophia Chen', 'APAC Region — Singapore', 1450, '2026-10-01', 'Enterprise Vitality Packs', 'REC-2026-9812', 'APPROVED', 'Verified in ledger'),
('Alexander Wright', 'Global HQ — London', 2200, '2026-10-02', 'Corporate Wellness System', 'REC-2026-9890', 'PENDING', 'Awaiting review'),
('Beatrice Lawson', 'Americas Hub — New York', 850, '2026-09-28', 'Executive Health Kit', 'REC-2026-9743', 'APPROVED', 'System verified')
ON CONFLICT DO NOTHING;

-- Seed Dues
INSERT INTO public.dues (member_name, office_name, month_year, amount, due_date, status, payment_method)
VALUES
('Eleanor Sterling', 'Global HQ — London', 'October 2026', 150, '2026-10-05', 'COMPLETED', 'Corporate Direct Debit'),
('David K. Ross', 'Americas Hub — New York', 'October 2026', 150, '2026-10-05', 'COMPLETED', 'Visa Corporate'),
('Sophia Chen', 'APAC Region — Singapore', 'October 2026', 150, '2026-10-05', 'PENDING', 'Pending Invoice')
ON CONFLICT DO NOTHING;

-- Seed Attendance
INSERT INTO public.attendance (member_name, office_name, date, check_in_time, event_type, status)
VALUES
('Marcus Vance', 'Global HQ — London', '2026-10-02', '08:45 AM', 'Weekly Leadership Summit', 'ACTIVE'),
('Eleanor Sterling', 'Global HQ — London', '2026-10-02', '08:52 AM', 'Weekly Leadership Summit', 'ACTIVE'),
('Sophia Chen', 'APAC Region — Singapore', '2026-10-01', '09:10 AM', 'APAC Strategy Briefing', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Seed Earnings
INSERT INTO public.earnings (member_name, period, base_commission, volume_bonus, leadership_override, total_amount, status)
VALUES
('Marcus Vance', 'Q3 2026', 45000, 18500, 12000, 75500, 'COMPLETED'),
('Eleanor Sterling', 'Q3 2026', 24000, 9800, 4500, 38300, 'COMPLETED'),
('David K. Ross', 'Q3 2026', 21500, 8200, 3900, 33600, 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Seed Health Scores
INSERT INTO public.health_scores (member_name, vitality_score, activity_index, retention_risk, engagement_grade, last_assessment_date)
VALUES
('Marcus Vance', 94, 98, 'LOW', 'A+', '2026-09-28'),
('Eleanor Sterling', 91, 92, 'LOW', 'A+', '2026-09-30'),
('Sophia Chen', 85, 86, 'LOW', 'A', '2026-09-29')
ON CONFLICT DO NOTHING;

-- Seed Activities
INSERT INTO public.activities (type, title, description, timestamp, user_name, status)
VALUES
('pv_submitted', 'New PV Submission', 'Alexander Wright submitted 2,200 PV for Corporate Wellness System', '12 minutes ago', 'Alexander Wright', 'PENDING'),
('attendance_recorded', 'Leadership Summit Check-in', 'Marcus Vance checked into Weekly Leadership Summit', '1 hour ago', 'Marcus Vance', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Seed Notifications
INSERT INTO public.notifications (title, message, timestamp, read, type)
VALUES
('PV Submission Approved', 'Your 1,450 PV submission has been approved.', '10m ago', FALSE, 'gold'),
('Weekly Summit Reminder', 'Global Leadership Summit starts tomorrow at 09:00 AM BST.', '1h ago', FALSE, 'info')
ON CONFLICT DO NOTHING;
