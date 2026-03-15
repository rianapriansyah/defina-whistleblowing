/**
 * Generates a unique complaint number (e.g. CMP-XXXXX-XXX).
 */
export function generateComplaintNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1_000_0)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0');
  return `CMP-${timestamp}-${random}`;
}

/**
 * Generates a random complaint password for tracking.
 */
export function generateComplaintPassword(): string {
  return Math.random().toString(36).slice(-10);
}
