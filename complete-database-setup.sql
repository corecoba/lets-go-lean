/* 
IMPORTANT: This file is being replaced with a modular approach!
===============================================================

This single-file database setup script has been replaced with a modular approach
to improve maintainability and error isolation.

Please use the scripts in the db-setup directory instead:

lets-go-lean/db-setup/
├── 00-run-all.sql       # Main script that runs all components in sequence
├── 01-types.sql         # Creates custom PostgreSQL enum types
├── 02-tables.sql        # Creates database tables
├── 03-rls.sql           # Sets up Row Level Security policies
├── 04-functions.sql     # Defines database functions
├── 05-indexes.sql       # Creates indexes for performance optimization
└── README.md            # Documentation for using the scripts

Benefits of the modular approach:
- Better error isolation - if one part fails, you know exactly where to look
- Easier maintenance - changes to one component don't affect others
- More control over execution - you can run parts separately as needed
- Improved readability - each file is focused on a specific task

For detailed instructions, see the README.md file in the db-setup directory.
*/

-- PostgreSQL compatibility adjustment: Using DO block for type creation
-- NOTE: For Supabase, CREATE TYPE IF NOT EXISTS is not supported, so we use this pattern
DO $$ 
BEGIN
  -- Create gender_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
  END IF;
  
  -- Create activity_level_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level_type') THEN
    CREATE TYPE activity_level_type AS ENUM ('sedentary', 'light', 'moderate', 'heavy');
  END IF;
  
  -- Create goal_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
    CREATE TYPE goal_type AS ENUM ('lose_weight', 'gain_weight', 'get_fit');
  END IF;
  
  -- Create last_ideal_shape_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'last_ideal_shape_type') THEN
    CREATE TYPE last_ideal_shape_type AS ENUM ('0-6_months', '6-12_months', '1-3_years', '3+_years', 'never');
  END IF;
  
  -- Create event_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('authentication', 'food_logging', 'activity', 'goal', 'health', 'navigation');
  END IF;
  
  -- Create experiment_status_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experiment_status_type') THEN
    CREATE TYPE experiment_status_type AS ENUM ('draft', 'active', 'completed', 'cancelled');
  END IF;
  
  -- Create environment_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'environment_type') THEN
    CREATE TYPE environment_type AS ENUM ('development', 'staging', 'production');
  END IF;
  
  -- Create meal_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_type') THEN
    CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
  END IF;
  
  -- Create serving_unit_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'serving_unit_type') THEN
    CREATE TYPE serving_unit_type AS ENUM ('g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'other');
  END IF;
  
  -- Create source_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type') THEN
    CREATE TYPE source_type AS ENUM ('manual', 'smart_scale', 'garmin', 'strava', 'fitbit', 'apple_health', 'other');
  END IF;
  
  -- Create food_source_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_source_type') THEN
    CREATE TYPE food_source_type AS ENUM ('fatsecret', 'usda', 'manual', 'other');
  END IF;
  
  -- Create food_category_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_category_type') THEN
    CREATE TYPE food_category_type AS ENUM ('vegetable', 'fruit', 'meat', 'dairy', 'grains', 'legumes', 'nuts', 'oils', 'beverages', 'processed', 'other');
  END IF;
  
  -- Create activity_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM ('running', 'cycling', 'walking', 'strength_training', 'swimming', 'yoga', 'hiking', 'dancing', 'other');
  END IF;
  
  -- Create goal_status_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status_type') THEN
    CREATE TYPE goal_status_type AS ENUM ('active', 'completed', 'cancelled');
  END IF;
  
  -- Create post_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
    CREATE TYPE post_type AS ENUM ('weight_milestone', 'food_log', 'activity_log', 'progress_photo', 'general');
  END IF;
  
  -- Create visibility_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_type') THEN
    CREATE TYPE visibility_type AS ENUM ('public', 'followers', 'private');
  END IF;
  
  -- Create interaction_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
    CREATE TYPE interaction_type AS ENUM ('like', 'comment', 'hug', 'share');
  END IF;
  
  -- Create follow_status_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'follow_status_type') THEN
    CREATE TYPE follow_status_type AS ENUM ('active', 'blocked', 'muted');
  END IF;
END $$;

-- PostgreSQL compatibility note: When dropping policies, check if they exist
-- Drop existing policies first
DO $$
BEGIN
  -- Safeguard for dropping policies that may not exist
  -- Note: Supabase might not have all these policies if this is the first run

  -- Check that tables exist before attempting to drop policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own data" ON users;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own data" ON users;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own data" ON users;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users cannot delete data" ON users;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;

  -- Food logs policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'food_logs') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own food logs" ON food_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own food logs" ON food_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own food logs" ON food_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own food logs" ON food_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- Body composition logs policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'body_composition_logs') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own body composition logs" ON body_composition_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own body composition logs" ON body_composition_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own body composition logs" ON body_composition_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own body composition logs" ON body_composition_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- Activity logs policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_logs') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own activity logs" ON activity_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own activity logs" ON activity_logs;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- User goals policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_goals') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can insert their own goals" ON user_goals;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can view their own goals" ON user_goals;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own goals" ON user_goals;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own goals" ON user_goals;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- Food database policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'food_database') THEN
    BEGIN
      DROP POLICY IF EXISTS "Food database is viewable by all users" ON food_database;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- Social posts policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'social_posts') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can view all posts" ON social_posts;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can create their own posts" ON social_posts;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own posts" ON social_posts;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own posts" ON social_posts;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- Social interactions policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'social_interactions') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can view all interactions" ON social_interactions;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can create their own interactions" ON social_interactions;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own comments" ON social_interactions;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own interactions" ON social_interactions;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
  
  -- User follows policies
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_follows') THEN
    BEGIN
      DROP POLICY IF EXISTS "Users can see all follows" ON user_follows;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can create their own follows" ON user_follows;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can update their own follows" ON user_follows;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
      DROP POLICY IF EXISTS "Users can delete their own follows" ON user_follows;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
END $$;

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

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_type post_type DEFAULT 'general',
  content TEXT,
  media_urls JSONB,
  related_food_log_id UUID REFERENCES food_logs(id) ON DELETE SET NULL,
  related_activity_log_id UUID REFERENCES activity_logs(id) ON DELETE SET NULL,
  related_weight_log_id UUID REFERENCES body_composition_logs(id) ON DELETE SET NULL,
  visibility visibility_type DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  hugs_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social interactions table
CREATE TABLE IF NOT EXISTS social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  comment_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status follow_status_type DEFAULT 'active'
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
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for social features

-- Social Posts Policies
CREATE POLICY "Users can view all posts"
  ON social_posts FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can create their own posts"
  ON social_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON social_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON social_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Social Interactions Policies
CREATE POLICY "Users can view all interactions"
  ON social_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own interactions"
  ON social_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON social_interactions FOR UPDATE
  USING (auth.uid() = user_id AND interaction_type = 'comment')
  WITH CHECK (auth.uid() = user_id AND interaction_type = 'comment');

CREATE POLICY "Users can delete their own interactions"
  ON social_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- User Follows Policies
CREATE POLICY "Users can see all follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their own follows"
  ON user_follows FOR UPDATE
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- PostgreSQL compatibility note: When dropping functions, check if they exist
-- Drop existing function first
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.create_user_profile(
    uuid, text, text, text, text, numeric, numeric, text, 
    date, text, numeric, numeric, integer, date, text
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop log_food function
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.log_food(
    uuid, uuid, date, meal_type, decimal, serving_unit_type, 
    integer, decimal, decimal, decimal, text
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop log_weight function
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.log_weight(
    uuid, date, decimal, decimal, decimal, decimal, source_type
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop log_activity function to avoid duplicate function error
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.log_activity(
    uuid, text, integer, date, integer, text, timestamp with time zone, 
    timestamp with time zone, decimal, integer, integer, integer, 
    integer, text, text, jsonb, text
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop create_post function
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.create_post(
    uuid, text, text, jsonb, uuid, uuid, uuid, text
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop interact_with_post function
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.interact_with_post(
    uuid, uuid, text, text
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

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
  -- Set search path to public for security
  SET search_path = public;
  
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
  -- Set search path to public for security
  SET search_path = public;
  
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
  -- Set search path to public for security
  SET search_path = public;
  
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

-- Helper function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  user_id uuid,
  activity_type text,
  duration_minutes integer,
  date date,
  calories_burned integer DEFAULT NULL,
  activity_id text DEFAULT NULL,
  start_time timestamp with time zone DEFAULT NULL,
  end_time timestamp with time zone DEFAULT NULL,
  distance_km decimal DEFAULT NULL,
  steps integer DEFAULT NULL,
  average_heart_rate integer DEFAULT NULL,
  max_heart_rate integer DEFAULT NULL,
  elevation_gain_m integer DEFAULT NULL,
  source text DEFAULT 'manual',
  location_name text DEFAULT NULL,
  weather_info jsonb DEFAULT NULL,
  notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  activity_log_id uuid;
BEGIN
  -- Set search path to public for security
  SET search_path = public;
  
  -- Validate that activity_type is valid
  IF activity_type NOT IN ('running', 'cycling', 'walking', 'strength_training', 'swimming', 'yoga', 'hiking', 'dancing', 'other') THEN
    RAISE EXCEPTION 'Invalid activity type: %', activity_type;
  END IF;
  
  -- Validate source
  IF source NOT IN ('manual', 'smart_scale', 'garmin', 'strava', 'fitbit', 'apple_health', 'other') THEN
    RAISE EXCEPTION 'Invalid source: %', source;
  END IF;

  -- Insert activity log
  INSERT INTO activity_logs (
    user_id,
    activity_type,
    date,
    duration_minutes,
    activity_id,
    start_time,
    end_time,
    distance_km,
    steps,
    average_heart_rate,
    max_heart_rate,
    elevation_gain_m,
    calories_burned,
    source,
    location_name,
    weather_info,
    notes
  )
  VALUES (
    user_id,
    activity_type::activity_type,
    date,
    duration_minutes,
    activity_id,
    start_time,
    end_time,
    distance_km,
    steps,
    average_heart_rate,
    max_heart_rate,
    elevation_gain_m,
    calories_burned,
    source::source_type,
    location_name,
    weather_info,
    notes
  )
  RETURNING id INTO activity_log_id;
  
  RETURN activity_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for creating posts
CREATE OR REPLACE FUNCTION public.create_post(
  user_id uuid,
  post_type text,
  content text,
  media_urls jsonb DEFAULT NULL,
  related_food_log_id uuid DEFAULT NULL,
  related_activity_log_id uuid DEFAULT NULL,
  related_weight_log_id uuid DEFAULT NULL,
  visibility text DEFAULT 'public'
)
RETURNS uuid AS $$
DECLARE
  post_id uuid;
BEGIN
  -- Set search path to public for security
  SET search_path = public;
  
  -- Validate the post type
  IF post_type NOT IN ('weight_milestone', 'food_log', 'activity_log', 'progress_photo', 'general') THEN
    RAISE EXCEPTION 'Invalid post type: %', post_type;
  END IF;
  
  -- Validate visibility
  IF visibility NOT IN ('public', 'followers', 'private') THEN
    RAISE EXCEPTION 'Invalid visibility: %', visibility;
  END IF;
  
  -- Validate related IDs based on post type
  IF post_type = 'food_log' AND related_food_log_id IS NULL THEN
    RAISE EXCEPTION 'Food log post must have related_food_log_id';
  ELSIF post_type = 'activity_log' AND related_activity_log_id IS NULL THEN
    RAISE EXCEPTION 'Activity log post must have related_activity_log_id';
  ELSIF post_type = 'weight_milestone' AND related_weight_log_id IS NULL THEN
    RAISE EXCEPTION 'Weight milestone post must have related_weight_log_id';
  END IF;
  
  -- Insert the post
  INSERT INTO social_posts (
    user_id,
    post_type,
    content,
    media_urls,
    related_food_log_id,
    related_activity_log_id,
    related_weight_log_id,
    visibility
  )
  VALUES (
    user_id,
    post_type::post_type,
    content,
    media_urls,
    related_food_log_id,
    related_activity_log_id,
    related_weight_log_id,
    visibility::visibility_type
  )
  RETURNING id INTO post_id;
  
  RETURN post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for social interactions
CREATE OR REPLACE FUNCTION public.interact_with_post(
  user_id uuid,
  post_id uuid,
  interaction_type text,
  comment_content text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  interaction_id uuid;
  post_owner_id uuid;
  post_likes integer;
  post_comments integer;
  post_hugs integer;
BEGIN
  -- Set search path to public for security
  SET search_path = public;
  
  -- Check if post exists
  SELECT user_id INTO post_owner_id FROM social_posts WHERE id = post_id;
  IF post_owner_id IS NULL THEN
    RAISE EXCEPTION 'Post with id % does not exist', post_id;
  END IF;
  
  -- Validate interaction type
  IF interaction_type NOT IN ('like', 'comment', 'hug', 'share') THEN
    RAISE EXCEPTION 'Invalid interaction type: %', interaction_type;
  END IF;
  
  -- Check comment content for comments
  IF interaction_type = 'comment' AND comment_content IS NULL THEN
    RAISE EXCEPTION 'Comment content is required for comment interactions';
  END IF;
  
  -- Check for duplicate likes and hugs
  IF interaction_type IN ('like', 'hug') THEN
    IF EXISTS (
      SELECT 1 FROM social_interactions 
      WHERE user_id = interact_with_post.user_id 
      AND post_id = interact_with_post.post_id 
      AND interaction_type = interact_with_post.interaction_type::interaction_type
    ) THEN
      -- Remove the existing interaction (toggle behavior)
      DELETE FROM social_interactions
      WHERE user_id = interact_with_post.user_id 
      AND post_id = interact_with_post.post_id 
      AND interaction_type = interact_with_post.interaction_type::interaction_type
      RETURNING id INTO interaction_id;
      
      -- Update the counts
      UPDATE social_posts
      SET 
        likes_count = CASE WHEN interaction_type = 'like' THEN likes_count - 1 ELSE likes_count END,
        hugs_count = CASE WHEN interaction_type = 'hug' THEN hugs_count - 1 ELSE hugs_count END
      WHERE id = post_id;
      
      RETURN interaction_id;
    END IF;
  END IF;
  
  -- Create the interaction
  INSERT INTO social_interactions (
    user_id,
    post_id,
    interaction_type,
    comment_content
  )
  VALUES (
    user_id,
    post_id,
    interaction_type::interaction_type,
    comment_content
  )
  RETURNING id INTO interaction_id;
  
  -- Update post counters
  UPDATE social_posts
  SET 
    likes_count = CASE WHEN interaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
    comments_count = CASE WHEN interaction_type = 'comment' THEN comments_count + 1 ELSE comments_count END,
    hugs_count = CASE WHEN interaction_type = 'hug' THEN hugs_count + 1 ELSE hugs_count END
  WHERE id = post_id;
  
  RETURN interaction_id;
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

-- Create indexes for social tables
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_post_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_interactions_post_id ON social_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_id ON social_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id); 