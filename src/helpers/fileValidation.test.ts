import { describe, it, expect } from 'vitest';
import { isAllowedFile } from './fileValidation';

function fileLike(name: string, type: string): File {
  return { name, type, size: 0 } as File;
}

describe('fileValidation', () => {
  describe('isAllowedFile', () => {
    it('accepts jpg files', () => {
      expect(isAllowedFile(fileLike('photo.jpg', 'image/jpeg'))).toBe(true);
    });

    it('accepts jpeg files', () => {
      expect(isAllowedFile(fileLike('photo.jpeg', 'image/jpeg'))).toBe(true);
    });

    it('accepts png files', () => {
      expect(isAllowedFile(fileLike('image.png', 'image/png'))).toBe(true);
    });

    it('accepts pdf files', () => {
      expect(isAllowedFile(fileLike('doc.pdf', 'application/pdf'))).toBe(true);
    });

    it('rejects exe files', () => {
      expect(isAllowedFile(fileLike('app.exe', 'application/x-msdownload'))).toBe(false);
    });

    it('rejects doc files', () => {
      expect(isAllowedFile(fileLike('doc.doc', 'application/msword'))).toBe(false);
    });

    it('rejects txt files', () => {
      expect(isAllowedFile(fileLike('readme.txt', 'text/plain'))).toBe(false);
    });
  });
});
