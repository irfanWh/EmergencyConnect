-- Run this in the Supabase SQL Editor

-- Enums for safety and validation
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'driver');
CREATE TYPE alert_status AS ENUM ('active', 'resolved', 'cancelled');
CREATE TYPE response_status AS ENUM ('accepted', 'en_route', 'arrived');

-- 1. Users Table (Public Profile)
-- Note: In a real Supabase app, this would be linked to auth.users via a trigger
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- references Supabase auth.users
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Emergency Alerts
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    ai_guidance TEXT, -- Populated by the AI agent
    status alert_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Locations (Tracking both Patient and Responder)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Responses (Doctor/Driver taking action)
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status response_status DEFAULT 'accepted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a mock user for the MVP if needed (matching the hardcoded ID in main.py)
INSERT INTO public.users (id, name, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'MVP Patient', 'patient')
ON CONFLICT (id) DO NOTHING;
