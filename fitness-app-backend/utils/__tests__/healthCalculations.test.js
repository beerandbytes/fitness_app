const {
  calculateBMR,
  calculateTDEE,
  calculateRecommendedCalories,
} = require('../healthCalculations');

describe('Health Calculations', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for male', () => {
      const bmr = calculateBMR(70, 175, 30, 'male');
      expect(bmr).toBeGreaterThan(0);
      expect(typeof bmr).toBe('number');
    });

    it('should calculate BMR for female', () => {
      const bmr = calculateBMR(60, 165, 25, 'female');
      expect(bmr).toBeGreaterThan(0);
      expect(typeof bmr).toBe('number');
    });

    it('should return different BMR for different weights', () => {
      const bmr1 = calculateBMR(70, 175, 30, 'male');
      const bmr2 = calculateBMR(80, 175, 30, 'male');
      expect(bmr2).toBeGreaterThan(bmr1);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE with sedentary activity', () => {
      const bmr = 1800;
      const tdee = calculateTDEE(bmr, 'sedentary');
      expect(tdee).toBeGreaterThan(bmr);
    });

    it('should calculate TDEE with moderate activity', () => {
      const bmr = 1800;
      const tdee = calculateTDEE(bmr, 'moderate');
      expect(tdee).toBeGreaterThan(bmr);
    });

    it('should return higher TDEE for higher activity levels', () => {
      const bmr = 1800;
      const sedentary = calculateTDEE(bmr, 'sedentary');
      const moderate = calculateTDEE(bmr, 'moderate');
      const active = calculateTDEE(bmr, 'active');
      expect(moderate).toBeGreaterThan(sedentary);
      expect(active).toBeGreaterThan(moderate);
    });
  });

  describe('calculateRecommendedCalories', () => {
    it('should calculate calories for weight loss', () => {
      const result = calculateRecommendedCalories({
        currentWeight: 80,
        targetWeight: 70,
        goalType: 'weight_loss',
        height: 175,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
      });
      expect(result).toHaveProperty('dailyCalories');
      expect(result.dailyCalories).toBeGreaterThan(0);
    });

    it('should calculate calories for weight gain', () => {
      const result = calculateRecommendedCalories({
        currentWeight: 60,
        targetWeight: 70,
        goalType: 'weight_gain',
        height: 165,
        age: 25,
        gender: 'female',
        activityLevel: 'moderate',
      });
      expect(result).toHaveProperty('dailyCalories');
      expect(result.dailyCalories).toBeGreaterThan(0);
    });
  });
});
