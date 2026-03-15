import { describe, it, expect } from 'vitest';
import { generateComplaintNumber, generateComplaintPassword } from './complaintGenerators';

describe('complaintGenerators', () => {
  describe('generateComplaintNumber', () => {
    it('returns a string starting with CMP-', () => {
      expect(generateComplaintNumber()).toMatch(/^CMP-/);
    });

    it('returns unique values', () => {
      const a = generateComplaintNumber();
      const b = generateComplaintNumber();
      expect(a).not.toBe(b);
    });
  });

  describe('generateComplaintPassword', () => {
    it('returns a non-empty string', () => {
      const p = generateComplaintPassword();
      expect(p).toBeTruthy();
      expect(typeof p).toBe('string');
    });

    it('returns unique values', () => {
      const a = generateComplaintPassword();
      const b = generateComplaintPassword();
      expect(a).not.toBe(b);
    });
  });
});
