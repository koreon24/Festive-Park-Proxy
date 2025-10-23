-- Add user_id column to link verifications to auth users
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);

-- Enable RLS on verifications table
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own verifications
CREATE POLICY "Users can view own verifications" ON verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own verifications
CREATE POLICY "Users can insert own verifications" ON verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all verifications
CREATE POLICY "Admins can view all verifications" ON verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('carsonzhorse@gmail.com', 'ChenEmperor1020@gmail.com')
    )
  );

-- Allow admins to update all verifications
CREATE POLICY "Admins can update all verifications" ON verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('carsonzhorse@gmail.com', 'ChenEmperor1020@gmail.com')
    )
  );
