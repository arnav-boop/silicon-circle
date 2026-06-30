-- HelixHack 2026 Supabase Schema Migration
-- Run this in your Supabase SQL Editor (https://tfmtivzgwtvdegcskmzz.supabase.co → SQL Editor)

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pitch-only', 'prototype')),
  theme TEXT NOT NULL,
  school TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT NOT NULL DEFAULT '',
  members JSONB DEFAULT '[]'::jsonb,
  submissions JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'submitted', 'finalist', 'fellow', 'disqualified')),
  feedback TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scores Table
CREATE TABLE IF NOT EXISTS scores (
  team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
  innovation INT DEFAULT 0,
  stem INT DEFAULT 0,
  feasibility INT DEFAULT 0,
  impact INT DEFAULT 0,
  execution INT DEFAULT 0,
  presentation INT DEFAULT 0,
  bonus INT DEFAULT 0,
  total INT DEFAULT 0
);

-- 3. Logs Table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  text TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  label TEXT NOT NULL
);

-- Seed default feature flags
INSERT INTO feature_flags (key, enabled, label) VALUES
  ('registration_open', true, 'Registration Form'),
  ('results_visible', false, 'Results & Leaderboard'),
  ('dashboard_enabled', true, 'Team Dashboard'),
  ('timeline_visible', true, 'Event Timeline')
ON CONFLICT (key) DO NOTHING;

-- 5. Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Teams: Anyone can read, insert, update
CREATE POLICY "Allow public read on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON teams FOR UPDATE USING (true);

-- Scores: Anyone can read, insert, update
CREATE POLICY "Allow public read on scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scores" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on scores" ON scores FOR UPDATE USING (true);

-- Logs: Anyone can read, insert, update
CREATE POLICY "Allow public read on logs" ON logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on logs" ON logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on logs" ON logs FOR UPDATE USING (true);

-- Feature Flags: Anyone can read, update
CREATE POLICY "Allow public read on feature_flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Allow public update on feature_flags" ON feature_flags FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_logs_team_id ON logs(team_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date);
