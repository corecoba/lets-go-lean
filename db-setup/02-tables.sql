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

-- Parent logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_type log_type NOT NULL,
  date DATE NOT NULL,
  source source_type DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Food log details
CREATE TABLE IF NOT EXISTS food_log_details (
  log_id UUID PRIMARY KEY REFERENCES logs(id) ON DELETE CASCADE,
  food_id UUID REFERENCES food_database(id) ON DELETE SET NULL,
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
  iron DECIMAL
);

-- Activity log details
CREATE TABLE IF NOT EXISTS activity_log_details (
  log_id UUID PRIMARY KEY REFERENCES logs(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  distance_km DECIMAL,
  steps INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  elevation_gain_m INTEGER,
  location_name TEXT,
  weather_info JSONB
);

-- Body composition log details
CREATE TABLE IF NOT EXISTS body_composition_log_details (
  log_id UUID PRIMARY KEY REFERENCES logs(id) ON DELETE CASCADE,
  weight DECIMAL NOT NULL,
  body_fat_percentage DECIMAL,
  visceral_fat_percentage DECIMAL,
  muscle_mass_kg DECIMAL,
  water_percentage DECIMAL,
  bone_mass_kg DECIMAL,
  bmi DECIMAL,
  bmr DECIMAL,
  metabolic_age INTEGER,
  device_id TEXT
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type goal_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  target_weight DECIMAL NOT NULL,
  initial_weight DECIMAL NOT NULL,
  target_calories INTEGER,
  bmr DECIMAL,
  status goal_status_type DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Goal progress tracking
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  current_weight DECIMAL NOT NULL,
  body_fat_percentage DECIMAL,
  muscle_mass_kg DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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