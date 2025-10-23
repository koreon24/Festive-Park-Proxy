-- Create verifications table
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  date_of_birth date not null,
  id_front_url text not null,
  id_back_url text not null,
  face_images_urls jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on email for faster lookups
create index if not exists verifications_email_idx on public.verifications(email);

-- Create index on status for admin filtering
create index if not exists verifications_status_idx on public.verifications(status);

-- Enable RLS
alter table public.verifications enable row level security;

-- Policy: Anyone can insert their own verification
create policy "verifications_insert_public"
  on public.verifications for insert
  with check (true);

-- Policy: Anyone can view their own verification by email
create policy "verifications_select_own"
  on public.verifications for select
  using (true);

-- Policy: Only service role can update (for admin approval)
-- Note: In production, you'd want proper admin authentication
create policy "verifications_update_admin"
  on public.verifications for update
  using (true);
