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
  
  -- Create log_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_type') THEN
    CREATE TYPE log_type AS ENUM ('food', 'activity', 'body_composition');
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