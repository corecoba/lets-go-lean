export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          birth_date: string | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'heavy' | null
          goal_type: 'lose_weight' | 'gain_weight' | 'get_fit' | null
          target_weight: number | null
          current_weight: number | null
          last_ideal_shape: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never' | null
          target_calories: number | null
          bmr: number | null
          estimated_goal_date: string | null
          experiment_group: string | null
          feature_flags: Json | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          birth_date?: string | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'heavy' | null
          goal_type?: 'lose_weight' | 'gain_weight' | 'get_fit' | null
          target_weight?: number | null
          current_weight?: number | null
          last_ideal_shape?: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never' | null
          target_calories?: number | null
          bmr?: number | null
          estimated_goal_date?: string | null
          experiment_group?: string | null
          feature_flags?: Json | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          birth_date?: string | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'heavy' | null
          goal_type?: 'lose_weight' | 'gain_weight' | 'get_fit' | null
          target_weight?: number | null
          current_weight?: number | null
          last_ideal_shape?: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never' | null
          target_calories?: number | null
          bmr?: number | null
          estimated_goal_date?: string | null
          experiment_group?: string | null
          feature_flags?: Json | null
        }
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_id: string | null
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          serving_size: number
          serving_unit: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'other'
          calories: number
          protein: number | null
          carbohydrates: number | null
          fat: number | null
          fiber: number | null
          sugar: number | null
          saturated_fat: number | null
          trans_fat: number | null
          cholesterol: number | null
          sodium: number | null
          potassium: number | null
          calcium: number | null
          iron: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id?: string | null
          date: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          serving_size: number
          serving_unit?: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'other'
          calories: number
          protein?: number | null
          carbohydrates?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          saturated_fat?: number | null
          trans_fat?: number | null
          cholesterol?: number | null
          sodium?: number | null
          potassium?: number | null
          calcium?: number | null
          iron?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_id?: string | null
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          serving_size?: number
          serving_unit?: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'other'
          calories?: number
          protein?: number | null
          carbohydrates?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          saturated_fat?: number | null
          trans_fat?: number | null
          cholesterol?: number | null
          sodium?: number | null
          potassium?: number | null
          calcium?: number | null
          iron?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_composition_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          body_fat_percentage: number | null
          visceral_fat_percentage: number | null
          muscle_mass_kg: number | null
          water_percentage: number | null
          bone_mass_kg: number | null
          bmi: number | null
          bmr: number | null
          metabolic_age: number | null
          source: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          device_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          body_fat_percentage?: number | null
          visceral_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          bmi?: number | null
          bmr?: number | null
          metabolic_age?: number | null
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          device_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          body_fat_percentage?: number | null
          visceral_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          bmi?: number | null
          bmr?: number | null
          metabolic_age?: number | null
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          device_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          activity_id: string | null
          activity_type: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          date: string
          start_time: string | null
          end_time: string | null
          duration_minutes: number
          distance_km: number | null
          steps: number | null
          average_heart_rate: number | null
          max_heart_rate: number | null
          elevation_gain_m: number | null
          calories_burned: number | null
          source: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          location_name: string | null
          weather_info: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id?: string | null
          activity_type: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          date: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes: number
          distance_km?: number | null
          steps?: number | null
          average_heart_rate?: number | null
          max_heart_rate?: number | null
          elevation_gain_m?: number | null
          calories_burned?: number | null
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          location_name?: string | null
          weather_info?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string | null
          activity_type?: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          date?: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number
          distance_km?: number | null
          steps?: number | null
          average_heart_rate?: number | null
          max_heart_rate?: number | null
          elevation_gain_m?: number | null
          calories_burned?: number | null
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          location_name?: string | null
          weather_info?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_posts: {
        Row: {
          id: string
          user_id: string
          post_type: 'weight_milestone' | 'food_log' | 'activity_log' | 'progress_photo' | 'general'
          content: string | null
          media_urls: Json | null
          related_food_log_id: string | null
          related_activity_log_id: string | null
          related_weight_log_id: string | null
          visibility: 'public' | 'followers' | 'private'
          likes_count: number
          comments_count: number
          hugs_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_type?: 'weight_milestone' | 'food_log' | 'activity_log' | 'progress_photo' | 'general'
          content?: string | null
          media_urls?: Json | null
          related_food_log_id?: string | null
          related_activity_log_id?: string | null
          related_weight_log_id?: string | null
          visibility?: 'public' | 'followers' | 'private'
          likes_count?: number
          comments_count?: number
          hugs_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_type?: 'weight_milestone' | 'food_log' | 'activity_log' | 'progress_photo' | 'general'
          content?: string | null
          media_urls?: Json | null
          related_food_log_id?: string | null
          related_activity_log_id?: string | null
          related_weight_log_id?: string | null
          visibility?: 'public' | 'followers' | 'private'
          likes_count?: number
          comments_count?: number
          hugs_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      social_interactions: {
        Row: {
          id: string
          user_id: string
          post_id: string
          interaction_type: 'like' | 'comment' | 'hug' | 'share'
          comment_content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          interaction_type: 'like' | 'comment' | 'hug' | 'share'
          comment_content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          interaction_type?: 'like' | 'comment' | 'hug' | 'share'
          comment_content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
          status: 'active' | 'blocked' | 'muted'
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
          status?: 'active' | 'blocked' | 'muted'
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
          status?: 'active' | 'blocked' | 'muted'
        }
      }
    }
    Functions: {
      create_user_profile: {
        Args: {
          user_id: string
          user_email: string
          first_name: string
          last_name?: string
          goal_type: string
          current_weight: number
          height: number
          gender: string
          birth_date: string
          activity_level: string
          target_weight: number
          bmr: number
          target_calories: number
          estimated_goal_date: string
          last_ideal_shape?: string
        }
        Returns: undefined
      }
      log_food: {
        Args: {
          user_id: string
          food_id: string
          log_date: string
          meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          serving_size: number
          serving_unit: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'other'
          calories: number
          protein?: number
          carbs?: number
          fat?: number
          notes?: string
        }
        Returns: string
      }
      log_weight: {
        Args: {
          user_id: string
          log_date: string
          weight: number
          body_fat?: number
          visceral_fat?: number
          muscle_mass?: number
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
        }
        Returns: string
      }
      log_activity: {
        Args: {
          user_id: string
          activity_type: string
          duration_minutes: number
          date: string
          calories_burned?: number
          activity_id?: string
          start_time?: string
          end_time?: string
          distance_km?: number
          steps?: number
          average_heart_rate?: number
          max_heart_rate?: number
          elevation_gain_m?: number
          source?: string
          location_name?: string
          weather_info?: Json
          notes?: string
        }
        Returns: string
      }
      create_post: {
        Args: {
          user_id: string
          post_type: string
          content: string
          media_urls?: Json
          related_food_log_id?: string
          related_activity_log_id?: string
          related_weight_log_id?: string
          visibility?: string
        }
        Returns: string
      }
      interact_with_post: {
        Args: {
          user_id: string
          post_id: string
          interaction_type: string
          comment_content?: string
        }
        Returns: string
      }
    }
  }
} 