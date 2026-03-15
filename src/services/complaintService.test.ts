import { describe, it, expect } from 'vitest';
import {
  get_all_complaints,
  get_complaint_by_complaint_number,
  getComplaintByNumberAndPassword,
  createComplaint,
} from './complaintService';

describe('complaintService', () => {
  it('exports complaint API functions', () => {
    expect(typeof get_all_complaints).toBe('function');
    expect(typeof get_complaint_by_complaint_number).toBe('function');
    expect(typeof getComplaintByNumberAndPassword).toBe('function');
    expect(typeof createComplaint).toBe('function');
  });
});
