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

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_goal_type ON users(goal_type);
CREATE INDEX IF NOT EXISTS idx_users_activity_level ON users(activity_level);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);

-- Indexes for experiments table
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_start_date ON experiments(start_date);
CREATE INDEX IF NOT EXISTS idx_experiments_end_date ON experiments(end_date);

-- Indexes for feature_flags table
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

-- Indexes for food_database table
CREATE INDEX IF NOT EXISTS idx_food_database_name ON food_database(name);
CREATE INDEX IF NOT EXISTS idx_food_database_category ON food_database(category);
CREATE INDEX IF NOT EXISTS idx_food_database_barcode ON food_database(barcode);
CREATE INDEX IF NOT EXISTS idx_food_database_source ON food_database(source);
CREATE INDEX IF NOT EXISTS idx_food_database_is_verified ON food_database(is_verified);

-- Indexes for logs table (parent table)
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_log_type ON logs(log_type);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);

-- Indexes for food_log_details table
CREATE INDEX IF NOT EXISTS idx_food_log_details_food_id ON food_log_details(food_id);
CREATE INDEX IF NOT EXISTS idx_food_log_details_meal_type ON food_log_details(meal_type);
CREATE INDEX IF NOT EXISTS idx_food_log_details_calories ON food_log_details(calories);

-- Indexes for activity_log_details table
CREATE INDEX IF NOT EXISTS idx_activity_log_details_activity_type ON activity_log_details(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_details_duration_minutes ON activity_log_details(duration_minutes);
CREATE INDEX IF NOT EXISTS idx_activity_log_details_calories_burned ON activity_log_details(calories_burned);

-- Indexes for body_composition_log_details table
CREATE INDEX IF NOT EXISTS idx_body_composition_log_details_weight ON body_composition_log_details(weight);
CREATE INDEX IF NOT EXISTS idx_body_composition_log_details_body_fat_percentage ON body_composition_log_details(body_fat_percentage);
CREATE INDEX IF NOT EXISTS idx_body_composition_log_details_muscle_mass_kg ON body_composition_log_details(muscle_mass_kg);

-- Indexes for goals table
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON goals(start_date);
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON goals(end_date);

-- Indexes for goal_progress table
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_date ON goal_progress(date);
CREATE INDEX IF NOT EXISTS idx_goal_progress_current_weight ON goal_progress(current_weight);

-- Indexes for social_posts table
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_post_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_featured ON social_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);

-- Indexes for social_interactions table
CREATE INDEX IF NOT EXISTS idx_social_interactions_user_id ON social_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_post_id ON social_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_interactions_interaction_type ON social_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_social_interactions_created_at ON social_interactions(created_at);

-- Indexes for user_follows table
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_status ON user_follows(status);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created ON social_posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_date ON goal_progress(goal_id, date);
CREATE INDEX IF NOT EXISTS idx_food_log_details_log_meal ON food_log_details(log_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_details_log_type ON activity_log_details(log_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_body_composition_log_details_log_weight ON body_composition_log_details(log_id, weight); 