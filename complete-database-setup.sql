-- Create enum types first
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE activity_level_type AS ENUM ('sedentary', 'light', 'moderate', 'heavy');
CREATE TYPE goal_type AS ENUM ('lose_weight', 'gain_weight', 'get_fit');
CREATE TYPE last_ideal_shape_type AS ENUM ('0-6_months', '6-12_months', '1-3_years', '3+_years', 'never');
CREATE TYPE event_type AS ENUM ('authentication', 'food_logging', 'activity', 'goal', 'health', 'navigation');
CREATE TYPE experiment_status_type AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE environment_type AS ENUM ('development', 'staging', 'production');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE serving_unit_type AS ENUM ('g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'other');
CREATE TYPE source_type AS ENUM ('manual', 'smart_scale', 'garmin', 'strava', 'fitbit', 'apple_health', 'other');
CREATE TYPE food_source_type AS ENUM ('fatsecret', 'usda', 'manual', 'other');
CREATE TYPE food_category_type AS ENUM ('vegetable', 'fruit', 'meat', 'dairy', 'grains', 'legumes', 'nuts', 'oils', 'beverages', 'processed', 'other');
CREATE TYPE activity_type AS ENUM ('running', 'cycling', 'walking', 'strength_training', 'swimming', 'yoga', 'hiking', 'dancing', 'other');
CREATE TYPE goal_status_type AS ENUM ('active', 'completed', 'cancelled');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  gender gender_type,
  height DECIMAL,
  birth_date DATE,
  activity_level activity_level_type,
  goal_type goal_type,
  target_weight DECIMAL,
  current_weight DECIMAL,
  last_ideal_shape last_ideal_shape_type DEFAULT 'never',
  target_calories INTEGER,
  bmr DECIMAL,
  estimated_goal_date DATE,
  experiment_group TEXT,
  feature_flags JSONB
);

-- Event tracking table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type event_type NOT NULL,
  properties JSONB,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_info JSONB,
  location JSONB
);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status experiment_status_type DEFAULT 'draft',
  variants JSONB,
  metrics JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0,
  target_audience JSONB,
  environment environment_type DEFAULT 'development',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Food database table
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  local_name TEXT,
  brand_name TEXT,
  category food_category_type DEFAULT 'other',
  serving_size DECIMAL NOT NULL,
  serving_unit serving_unit_type DEFAULT 'g',
  calories INTEGER NOT NULL,
  protein DECIMAL,
  carbohydrates DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  saturated_fat DECIMAL,
  trans_fat DECIMAL,
  cholesterol DECIMAL,
  sodium DECIMAL,
  potassium DECIMAL,
  calcium DECIMAL,
  iron DECIMAL,
  standard_portion_100g DECIMAL,
  barcode TEXT,
  source food_source_type DEFAULT 'manual',
  source_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Food logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID REFERENCES food_database(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  meal_type meal_type DEFAULT 'snack',
  serving_size DECIMAL NOT NULL,
  serving_unit serving_unit_type DEFAULT 'g',
  calories INTEGER NOT NULL,
  protein DECIMAL,
  carbohydrates DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  saturated_fat DECIMAL,
  trans_fat DECIMAL,
  cholesterol DECIMAL,
  sodium DECIMAL,
  potassium DECIMAL,
  calcium DECIMAL,
  iron DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Body composition logs table
CREATE TABLE IF NOT EXISTS body_composition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL NOT NULL,
  body_fat_percentage DECIMAL,
  visceral_fat_percentage DECIMAL,
  muscle_mass_kg DECIMAL,
  water_percentage DECIMAL,
  bone_mass_kg DECIMAL,
  bmi DECIMAL,
  bmr DECIMAL,
  metabolic_age INTEGER,
  source source_type DEFAULT 'manual',
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  target_weight DECIMAL NOT NULL,
  current_weight DECIMAL NOT NULL,
  status goal_status_type DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_id TEXT,
  activity_type activity_type NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL,
  distance_km DECIMAL,
  steps INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  elevation_gain_m INTEGER,
  calories_burned INTEGER,
  source source_type DEFAULT 'manual',
  location_name TEXT,
  weather_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_composition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users cannot delete data" ON users;

-- Create RLS policies for users table
CREATE POLICY "Users can insert their own data" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users cannot delete data" 
ON users 
FOR DELETE 
USING (false);

-- Create RLS policies for food_logs table
CREATE POLICY "Users can insert their own food logs"
ON food_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own food logs"
ON food_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own food logs"
ON food_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food logs"
ON food_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for body_composition_logs table
CREATE POLICY "Users can insert their own body composition logs"
ON body_composition_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own body composition logs"
ON body_composition_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own body composition logs"
ON body_composition_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body composition logs"
ON body_composition_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for activity_logs table
CREATE POLICY "Users can insert their own activity logs"
ON activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity logs"
ON activity_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
ON activity_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs"
ON activity_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for user_goals table
CREATE POLICY "Users can insert their own goals"
ON user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goals"
ON user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON user_goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON user_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Food database is viewable by all authenticated users
CREATE POLICY "Food database is viewable by all users"
ON food_database
FOR SELECT
TO authenticated
USING (true);

-- Drop existing function first
DROP FUNCTION IF EXISTS public.create_user_profile;

-- Create a separate sign-up function that bypasses RLS
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

-- Function to log food
CREATE OR REPLACE FUNCTION public.log_food(
  user_id uuid,
  food_id uuid,
  log_date date,
  meal meal_type,
  serving_size decimal,
  serving_unit serving_unit_type,
  calories integer,
  protein decimal DEFAULT NULL,
  carbs decimal DEFAULT NULL,
  fat decimal DEFAULT NULL,
  notes text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.food_logs (
    user_id,
    food_id,
    date,
    meal_type,
    serving_size,
    serving_unit,
    calories,
    protein,
    carbohydrates,
    fat,
    notes,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    food_id,
    log_date,
    meal,
    serving_size,
    serving_unit,
    calories,
    protein,
    carbs,
    fat,
    notes,
    NOW(),
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log weight
CREATE OR REPLACE FUNCTION public.log_weight(
  user_id uuid,
  log_date date,
  weight decimal,
  body_fat decimal DEFAULT NULL,
  visceral_fat decimal DEFAULT NULL,
  muscle_mass decimal DEFAULT NULL,
  source source_type DEFAULT 'manual'
) RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.body_composition_logs (
    user_id,
    date,
    weight,
    body_fat_percentage,
    visceral_fat_percentage,
    muscle_mass_kg,
    source,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    log_date,
    weight,
    body_fat,
    visceral_fat,
    muscle_mass,
    source,
    NOW(),
    NOW()
  ) RETURNING id INTO log_id;
  
  -- Update current_weight in users table
  UPDATE public.users
  SET 
    current_weight = weight,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  user_id uuid,
  activity_type activity_type,
  log_date date,
  duration integer,
  calories integer,
  distance decimal DEFAULT NULL,
  steps integer DEFAULT NULL,
  notes text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    activity_type,
    date,
    duration_minutes,
    calories_burned,
    distance_km,
    steps,
    notes,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    activity_type,
    log_date,
    duration,
    calories,
    distance,
    steps,
    notes,
    NOW(),
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_food TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_weight TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
CREATE INDEX IF NOT EXISTS idx_body_composition_logs_user_id ON body_composition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_body_composition_logs_date ON body_composition_logs(date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date);
CREATE INDEX IF NOT EXISTS idx_food_database_name ON food_database(name);
CREATE INDEX IF NOT EXISTS idx_food_database_barcode ON food_database(barcode); 