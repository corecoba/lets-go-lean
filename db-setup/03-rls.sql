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