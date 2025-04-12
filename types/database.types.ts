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
          gender: 'male' | 'female' | 'other'
          height: number
          birth_date: string
          activity_level: 'sedentary' | 'light' | 'moderate' | 'heavy'
          goal_type: 'lose_weight' | 'gain_weight' | 'get_fit'
          target_weight: number
          current_weight: number
          last_ideal_shape: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never'
          target_calories: number
          bmr: number
          estimated_goal_date: string
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
          gender: 'male' | 'female' | 'other'
          height: number
          birth_date: string
          activity_level: 'sedentary' | 'light' | 'moderate' | 'heavy'
          goal_type: 'lose_weight' | 'gain_weight' | 'get_fit'
          target_weight: number
          current_weight: number
          last_ideal_shape?: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never'
          target_calories: number
          bmr: number
          estimated_goal_date: string
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
          gender?: 'male' | 'female' | 'other'
          height?: number
          birth_date?: string
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'heavy'
          goal_type?: 'lose_weight' | 'gain_weight' | 'get_fit'
          target_weight?: number
          current_weight?: number
          last_ideal_shape?: '0-6_months' | '6-12_months' | '1-3_years' | '3+_years' | 'never'
          target_calories?: number
          bmr?: number
          estimated_goal_date?: string
          experiment_group?: string | null
          feature_flags?: Json | null
        }
      }
      logs: {
        Row: {
          id: string
          user_id: string
          log_type: 'food' | 'activity' | 'body_composition'
          date: string
          source: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_type: 'food' | 'activity' | 'body_composition'
          date: string
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_type?: 'food' | 'activity' | 'body_composition'
          date?: string
          source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_log_details: {
        Row: {
          log_id: string
          food_id: string
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
        }
        Insert: {
          log_id: string
          food_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          serving_size: number
          serving_unit: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'other'
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
        }
        Update: {
          log_id?: string
          food_id?: string
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
        }
      }
      activity_log_details: {
        Row: {
          log_id: string
          activity_type: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          duration_minutes: number
          calories_burned: number | null
          distance_km: number | null
          steps: number | null
          average_heart_rate: number | null
          max_heart_rate: number | null
          elevation_gain_m: number | null
          location_name: string | null
          weather_info: Json | null
        }
        Insert: {
          log_id: string
          activity_type: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          duration_minutes: number
          calories_burned?: number | null
          distance_km?: number | null
          steps?: number | null
          average_heart_rate?: number | null
          max_heart_rate?: number | null
          elevation_gain_m?: number | null
          location_name?: string | null
          weather_info?: Json | null
        }
        Update: {
          log_id?: string
          activity_type?: 'running' | 'cycling' | 'walking' | 'strength_training' | 'swimming' | 'yoga' | 'hiking' | 'dancing' | 'other'
          duration_minutes?: number
          calories_burned?: number | null
          distance_km?: number | null
          steps?: number | null
          average_heart_rate?: number | null
          max_heart_rate?: number | null
          elevation_gain_m?: number | null
          location_name?: string | null
          weather_info?: Json | null
        }
      }
      body_composition_log_details: {
        Row: {
          log_id: string
          weight: number
          body_fat_percentage: number | null
          visceral_fat_percentage: number | null
          muscle_mass_kg: number | null
          water_percentage: number | null
          bone_mass_kg: number | null
          bmi: number | null
          bmr: number | null
          metabolic_age: number | null
          device_id: string | null
        }
        Insert: {
          log_id: string
          weight: number
          body_fat_percentage?: number | null
          visceral_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          bmi?: number | null
          bmr?: number | null
          metabolic_age?: number | null
          device_id?: string | null
        }
        Update: {
          log_id?: string
          weight?: number
          body_fat_percentage?: number | null
          visceral_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          bone_mass_kg?: number | null
          bmi?: number | null
          bmr?: number | null
          metabolic_age?: number | null
          device_id?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'lose_weight' | 'gain_weight' | 'get_fit'
          start_date: string
          end_date: string | null
          target_weight: number
          initial_weight: number
          target_calories: number | null
          bmr: number | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'lose_weight' | 'gain_weight' | 'get_fit'
          start_date: string
          end_date?: string | null
          target_weight: number
          initial_weight: number
          target_calories?: number | null
          bmr?: number | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'lose_weight' | 'gain_weight' | 'get_fit'
          start_date?: string
          end_date?: string | null
          target_weight?: number
          initial_weight?: number
          target_calories?: number | null
          bmr?: number | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      goal_progress: {
        Row: {
          id: string
          goal_id: string
          date: string
          current_weight: number
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          date: string
          current_weight: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          date?: string
          current_weight?: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_entry: {
        Args: {
          p_user_id: string
          p_log_type: 'food' | 'activity' | 'body_composition'
          p_date: string
          p_source?: 'manual' | 'smart_scale' | 'garmin' | 'strava' | 'fitbit' | 'apple_health' | 'other'
          p_notes?: string
          p_food_details?: Json
          p_activity_details?: Json
          p_body_composition_details?: Json
        }
        Returns: string
      }
      create_goal: {
        Args: {
          p_user_id: string
          p_goal_type: 'lose_weight' | 'gain_weight' | 'get_fit'
          p_target_weight: number
          p_initial_weight: number
          p_target_calories?: number
          p_bmr?: number
        }
        Returns: string
      }
      record_progress: {
        Args: {
          p_goal_id: string
          p_current_weight: number
          p_body_fat_percentage?: number
          p_muscle_mass_kg?: number
          p_notes?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 