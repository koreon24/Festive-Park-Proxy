-- Fix Row-Level Security policies for users table
-- Version 2: Add service role bypass and anon access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;

-- Allow authenticated users to insert their own row during signup
CREATE POLICY "Users can insert their own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own data
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
