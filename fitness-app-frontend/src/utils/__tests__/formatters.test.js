import { describe, it, expect } from 'vitest';
import { 
  formatWeight, 
  formatCalories, 
  formatDate, 
  formatNumber,
  formatInteger,
  formatMacros,
  formatPercentage,
  formatDuration,
  formatTime,
  formatDateTime,
  formatRelativeDate
} from '../formatters';

describe('Formatters', () => {
  describe('formatNumber', () => {
    it('should format number with decimals', () => {
      expect(formatNumber(70.5, 1)).toBe('70.5');
      expect(formatNumber(70.567, 2)).toBe('70.57');
    });

    it('should handle null and undefined', () => {
      expect(formatNumber(null, 1, 0)).toBe('0.0');
      expect(formatNumber(undefined, 1, 0)).toBe('0.0');
    });
  });

  describe('formatWeight', () => {
    it('should format weight correctly', () => {
      expect(formatWeight(70.5)).toBe('70.5 kg');
      expect(formatWeight(0)).toBe('0.0 kg');
    });

    it('should handle null and undefined', () => {
      expect(formatWeight(null)).toBe('0.0 kg');
      expect(formatWeight(undefined)).toBe('0.0 kg');
    });
  });

  describe('formatCalories', () => {
    it('should format calories correctly', () => {
      expect(formatCalories(2000)).toBe('2000');
      expect(formatCalories(1500.5)).toBe('1501');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01');
      const formatted = formatDate(date);
      expect(formatted).toBeDefined();
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatMacros', () => {
    it('should format macros correctly', () => {
      expect(formatMacros(25.5)).toBe('25.5g');
      expect(formatMacros(0)).toBe('0.0g');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(75.5, 1)).toBe('75.5%');
      expect(formatPercentage(100, 0)).toBe('100%');
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(30)).toBe('30min');
      expect(formatDuration(0)).toBe('0 min');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format relative dates', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now - 60000);
      const formatted = formatRelativeDate(oneMinuteAgo);
      expect(formatted).toContain('minuto');
    });
  });
});
