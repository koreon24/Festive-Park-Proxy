-- Create homework_users table for separate homework help authentication
CREATE TABLE IF NOT EXISTS homework_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_homework_users_email ON homework_users(email);

-- Enable Row Level Security
ALTER TABLE homework_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own homework data" ON homework_users
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own homework data" ON homework_users
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own homework data" ON homework_users
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);
