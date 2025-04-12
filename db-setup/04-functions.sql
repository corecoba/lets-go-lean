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
    uuid,  -- user_id
    text,  -- activity_type
    integer,  -- duration_minutes
    date,  -- date
    integer,  -- calories_burned
    text,  -- activity_id
    timestamp with time zone,  -- start_time
    timestamp with time zone,  -- end_time
    decimal,  -- distance_km
    integer,  -- steps
    integer,  -- average_heart_rate
    integer,  -- max_heart_rate
    integer,  -- elevation_gain_m
    text,  -- source
    text,  -- location_name
    jsonb  -- weather_info
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

-- Drop existing functions if they exist
DO $$
BEGIN
  -- Drop log_entry function
  DROP FUNCTION IF EXISTS public.log_entry(
    UUID, log_type, DATE, source_type, TEXT, JSONB, JSONB, JSONB
  );
  
  -- Drop log_activity function
  DROP FUNCTION IF EXISTS public.log_activity(
    UUID, TEXT, INTEGER, DATE, INTEGER, TEXT, TIMESTAMP WITH TIME ZONE,
    TIMESTAMP WITH TIME ZONE, DECIMAL, INTEGER, INTEGER, INTEGER,
    INTEGER, TEXT, TEXT, JSONB
  );
  
  -- Drop log_food function
  DROP FUNCTION IF EXISTS public.log_food(
    UUID, UUID, DATE, meal_type, DECIMAL, serving_unit_type,
    INTEGER, DECIMAL, DECIMAL, DECIMAL, TEXT
  );
  
  -- Drop log_weight function
  DROP FUNCTION IF EXISTS public.log_weight(
    UUID, DATE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, source_type
  );
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Create a new log entry (parent function)
CREATE OR REPLACE FUNCTION public.log_entry(
  p_user_id UUID,
  p_log_type log_type,
  p_date DATE,
  p_source source_type DEFAULT 'manual',
  p_notes TEXT DEFAULT NULL,
  p_food_details JSONB DEFAULT NULL,
  p_activity_details JSONB DEFAULT NULL,
  p_body_composition_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Insert into parent logs table
  INSERT INTO logs (user_id, log_type, date, source, notes)
  VALUES (p_user_id, p_log_type, p_date, p_source, p_notes)
  RETURNING id INTO v_log_id;

  -- Insert into appropriate child table based on log type
  CASE p_log_type
    WHEN 'food' THEN
      INSERT INTO food_log_details (
        log_id, food_id, meal_type, serving_size, serving_unit,
        calories, protein, carbohydrates, fat, fiber, sugar,
        saturated_fat, trans_fat, cholesterol, sodium, potassium,
        calcium, iron
      )
      VALUES (
        v_log_id,
        (p_food_details->>'food_id')::UUID,
        (p_food_details->>'meal_type')::meal_type,
        (p_food_details->>'serving_size')::DECIMAL,
        (p_food_details->>'serving_unit')::serving_unit_type,
        (p_food_details->>'calories')::INTEGER,
        (p_food_details->>'protein')::DECIMAL,
        (p_food_details->>'carbohydrates')::DECIMAL,
        (p_food_details->>'fat')::DECIMAL,
        (p_food_details->>'fiber')::DECIMAL,
        (p_food_details->>'sugar')::DECIMAL,
        (p_food_details->>'saturated_fat')::DECIMAL,
        (p_food_details->>'trans_fat')::DECIMAL,
        (p_food_details->>'cholesterol')::DECIMAL,
        (p_food_details->>'sodium')::DECIMAL,
        (p_food_details->>'potassium')::DECIMAL,
        (p_food_details->>'calcium')::DECIMAL,
        (p_food_details->>'iron')::DECIMAL
      );

    WHEN 'activity' THEN
      INSERT INTO activity_log_details (
        log_id, activity_type, duration_minutes, calories_burned,
        distance_km, steps, average_heart_rate, max_heart_rate,
        elevation_gain_m, location_name, weather_info
      )
      VALUES (
        v_log_id,
        (p_activity_details->>'activity_type')::activity_type,
        (p_activity_details->>'duration_minutes')::INTEGER,
        (p_activity_details->>'calories_burned')::INTEGER,
        (p_activity_details->>'distance_km')::DECIMAL,
        (p_activity_details->>'steps')::INTEGER,
        (p_activity_details->>'average_heart_rate')::INTEGER,
        (p_activity_details->>'max_heart_rate')::INTEGER,
        (p_activity_details->>'elevation_gain_m')::INTEGER,
        p_activity_details->>'location_name',
        (p_activity_details->>'weather_info')::JSONB
      );

    WHEN 'body_composition' THEN
      INSERT INTO body_composition_log_details (
        log_id, weight, body_fat_percentage, visceral_fat_percentage,
        muscle_mass_kg, water_percentage, bone_mass_kg, bmi, bmr,
        metabolic_age, device_id
      )
      VALUES (
        v_log_id,
        (p_body_composition_details->>'weight')::DECIMAL,
        (p_body_composition_details->>'body_fat_percentage')::DECIMAL,
        (p_body_composition_details->>'visceral_fat_percentage')::DECIMAL,
        (p_body_composition_details->>'muscle_mass_kg')::DECIMAL,
        (p_body_composition_details->>'water_percentage')::DECIMAL,
        (p_body_composition_details->>'bone_mass_kg')::DECIMAL,
        (p_body_composition_details->>'bmi')::DECIMAL,
        (p_body_composition_details->>'bmr')::DECIMAL,
        (p_body_composition_details->>'metabolic_age')::INTEGER,
        p_body_composition_details->>'device_id'
      );
  END CASE;

  -- Update user's current weight if it's a body composition log
  IF p_log_type = 'body_composition' AND p_body_composition_details->>'weight' IS NOT NULL THEN
    UPDATE users
    SET current_weight = (p_body_composition_details->>'weight')::DECIMAL,
        updated_at = now()
    WHERE id = p_user_id;
  END IF;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new goal
CREATE OR REPLACE FUNCTION public.create_goal(
  p_user_id UUID,
  p_goal_type goal_type,
  p_target_weight DECIMAL,
  p_initial_weight DECIMAL,
  p_target_calories INTEGER DEFAULT NULL,
  p_bmr DECIMAL DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_goal_id UUID;
BEGIN
  -- End any current active goal
  UPDATE goals
  SET end_date = CURRENT_DATE,
      status = 'completed'
  WHERE user_id = p_user_id
    AND status = 'active';

  -- Create new goal
  INSERT INTO goals (
    user_id, goal_type, start_date, target_weight,
    initial_weight, target_calories, bmr
  )
  VALUES (
    p_user_id, p_goal_type, CURRENT_DATE, p_target_weight,
    p_initial_weight, p_target_calories, p_bmr
  )
  RETURNING id INTO v_goal_id;

  -- Record initial progress
  INSERT INTO goal_progress (
    goal_id, date, current_weight
  )
  VALUES (
    v_goal_id, CURRENT_DATE, p_initial_weight
  );

  RETURN v_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record goal progress
CREATE OR REPLACE FUNCTION public.record_progress(
  p_goal_id UUID,
  p_current_weight DECIMAL,
  p_body_fat_percentage DECIMAL DEFAULT NULL,
  p_muscle_mass_kg DECIMAL DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from goal
  SELECT user_id INTO v_user_id
  FROM goals
  WHERE id = p_goal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  -- Record progress
  INSERT INTO goal_progress (
    goal_id, date, current_weight, body_fat_percentage,
    muscle_mass_kg, notes
  )
  VALUES (
    p_goal_id, CURRENT_DATE, p_current_weight,
    p_body_fat_percentage, p_muscle_mass_kg, p_notes
  );

  -- Update user's current weight
  UPDATE users
  SET current_weight = p_current_weight,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_entry TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_goal TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_progress TO authenticated; 