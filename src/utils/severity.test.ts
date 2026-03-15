import { describe, it, expect } from 'vitest';
import { getSeverityColor } from './severity';

describe('getSeverityColor', () => {
  it('returns success for low', () => {
    expect(getSeverityColor('low')).toBe('success');
  });

  it('returns info for medium', () => {
    expect(getSeverityColor('medium')).toBe('info');
  });

  it('returns warning for high', () => {
    expect(getSeverityColor('high')).toBe('warning');
  });

  it('returns error for critical', () => {
    expect(getSeverityColor('critical')).toBe('error');
  });

  it('returns default for null', () => {
    expect(getSeverityColor(null)).toBe('default');
  });

  it('returns default for unknown severity', () => {
    expect(getSeverityColor('unknown')).toBe('default');
  });

  it('is case insensitive', () => {
    expect(getSeverityColor('LOW')).toBe('success');
    expect(getSeverityColor('Critical')).toBe('error');
  });
});
