
import { describe, it, expect } from 'vitest';
import { translateStatus, translatePriority } from '@/services/reports/utils/translationUtils';

describe('translationUtils', () => {
  describe('translateStatus', () => {
    it('should translate known statuses correctly', () => {
      expect(translateStatus('scheduled')).toBe('Planifiée');
      expect(translateStatus('in-progress')).toBe('En cours');
      expect(translateStatus('completed')).toBe('Terminée');
      expect(translateStatus('canceled')).toBe('Annulée');
    });

    it('should return the original status for unknown values', () => {
      expect(translateStatus('unknown-status')).toBe('unknown-status');
      expect(translateStatus('')).toBe('');
    });
  });

  describe('translatePriority', () => {
    it('should translate known priorities correctly', () => {
      expect(translatePriority('low')).toBe('Basse');
      expect(translatePriority('medium')).toBe('Moyenne');
      expect(translatePriority('high')).toBe('Haute');
    });

    it('should return the original priority for unknown values', () => {
      expect(translatePriority('unknown-priority')).toBe('unknown-priority');
      expect(translatePriority('')).toBe('');
    });
  });
});
