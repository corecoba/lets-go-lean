import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityLevel, GoalType } from './healthCalculations';

const ONBOARDING_DATA_KEY = '@lets_go_lean:onboarding_data';

export type OnboardingData = {
  goal?: GoalType;
  current_weight?: number;
  height?: number;
  activity_level?: ActivityLevel;
  target_weight?: number;
  gender?: string;
  birth_date?: string;
  bmr?: number;
  tdee?: number;
  target_calories?: number;
  estimated_goal_date?: string;
};

export const storage = {
  async saveOnboardingData(data: Partial<OnboardingData>) {
    const existingData = await this.getOnboardingData() || {};
    const newData = { ...existingData, ...data };
    await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(newData));
    return newData;
  },

  async getOnboardingData(): Promise<OnboardingData | null> {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearOnboardingData() {
    await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
  }
}; 