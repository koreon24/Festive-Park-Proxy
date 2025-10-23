-- Disable email confirmation requirement and confirm existing users

-- Update all existing users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Note: To fully disable email confirmation for new signups,
-- you need to go to your Supabase Dashboard:
-- Authentication > Settings > Email Auth
-- And toggle OFF "Enable email confirmations"
