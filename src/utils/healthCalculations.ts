// lets-go-lean/src/utils/healthCalculations.ts
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy';
export type GoalType = 'lose_weight' | 'gain_weight' | 'get_fit';

export const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  // Validate inputs
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive numbers');
  }
  if (weight > 300 || height > 250 || age > 120) {
    throw new Error('Input values are outside reasonable ranges');
  }
  if (!['male', 'female', 'other'].includes(gender)) {
    throw new Error('Gender must be either "male", "female", or "other"');
  }

  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  // For 'other' gender, use an average of male and female values
  return Math.round(
    gender === 'male' 
      ? baseBMR + 5 
      : gender === 'female' 
        ? baseBMR - 161 
        : baseBMR - 78  // Average of male and female adjustments
  );
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  if (bmr <= 0) {
    throw new Error('BMR must be a positive number');
  }

  const activityMultipliers = {
    sedentary: 1.2,    // Little or no exercise
    light: 1.375,      // Light exercise 1-2 times/week
    moderate: 1.55,    // Moderate exercise 3-5 times/week
    heavy: 1.725       // Hard exercise 6-7 times/week
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

export const calculateTargetCalories = (tdee: number, goalType: GoalType): number => {
  if (tdee <= 0) {
    throw new Error('TDEE must be a positive number');
  }

  const adjustments = {
    lose_weight: -500,   // Caloric deficit for weight loss
    gain_weight: 500,    // Caloric surplus for weight gain
    get_fit: 0          // Maintenance calories for fitness
  };

  const targetCalories = tdee + adjustments[goalType];
  
  // Ensure minimum safe calories (1200 for women, 1500 for men as a general guideline)
  const minSafeCalories = 1200;
  return Math.max(Math.round(targetCalories), minSafeCalories);
};

export const calculateEstimatedGoalDate = (
  currentWeight: number,
  targetWeight: number,
  goalType: GoalType
): Date => {
  if (currentWeight <= 0 || targetWeight <= 0) {
    throw new Error('Weights must be positive numbers');
  }

  const weightDiff = Math.abs(currentWeight - targetWeight);
  
  // For weight loss/gain, assume 0.5-1kg per week is healthy
  // For maintenance (get_fit), set a default 12-week program
  const weeklyRate = goalType === 'get_fit' ? 0 : 0.5;
  const weeksToGoal = goalType === 'get_fit' ? 12 : weightDiff / weeklyRate;

  // Cap the maximum program length at 52 weeks (1 year)
  const cappedWeeks = Math.min(Math.ceil(weeksToGoal), 52);
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (cappedWeeks * 7));
  
  return estimatedDate;
};