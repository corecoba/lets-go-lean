export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy';

export type GoalType = 'lose_weight' | 'gain_weight' | 'get_fit';

export interface OnboardingData {
  current_weight?: number;
  target_weight?: number;
  height?: number;
  gender?: Gender;
  birth_date?: string;
  activity_level?: ActivityLevel;
  goal?: GoalType;
  bmr?: number;
  tdee?: number;
  target_calories?: number;
  estimated_goal_date?: string;
} 