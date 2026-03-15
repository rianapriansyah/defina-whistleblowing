const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

/**
 * Returns true if the file is allowed for complaint attachment (JPG, PNG, or PDF).
 */
export function isAllowedFile(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  return ALLOWED_FILE_TYPES.includes(file.type) && ALLOWED_EXTENSIONS.includes(ext);
}
