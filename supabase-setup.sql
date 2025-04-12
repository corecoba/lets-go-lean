-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users cannot delete data" ON users;

-- Create policies for the users table

-- Allow users to insert their own data during registration
CREATE POLICY "Users can insert their own data" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to view their own data
CREATE POLICY "Users can view their own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" 
ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Disallow users from deleting data (admin only)
CREATE POLICY "Users cannot delete data" 
ON users 
FOR DELETE 
USING (false);

-- Drop existing function first
DROP FUNCTION IF EXISTS public.create_user_profile;

-- Create a separate sign-up function that bypasses RLS
-- This is useful if your RLS is causing issues during registration
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id uuid,
  user_email text,
  first_name text,
  last_name text,
  goal_type text,
  current_weight numeric,
  height numeric,
  gender text,
  birth_date date,
  activity_level text,
  target_weight numeric,
  bmr numeric,
  target_calories integer,
  estimated_goal_date date,
  last_ideal_shape text DEFAULT 'never'
) RETURNS void AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at,
    is_active,
    goal_type,
    current_weight,
    height,
    gender,
    birth_date,
    activity_level,
    target_weight,
    bmr,
    target_calories,
    estimated_goal_date,
    last_ideal_shape
  ) VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    NOW(),
    NOW(),
    TRUE,
    goal_type,
    current_weight,
    height,
    gender,
    birth_date,
    activity_level,
    target_weight,
    bmr,
    target_calories,
    estimated_goal_date,
    last_ideal_shape
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon, authenticated; 