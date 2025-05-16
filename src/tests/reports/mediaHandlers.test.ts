
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsPDF } from 'jspdf';
import { addPhotos, addSignature } from '@/services/reports/components/mediaHandlers';
import { addSection } from '@/services/reports/components/sectionHandlers';

// Mock fetch API
global.fetch = vi.fn();

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      setFillColor: vi.fn(),
      rect: vi.fn(),
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      setTextColor: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      addImage: vi.fn(),
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297
        }
      }
    }))
  };
});

// Mock sectionHandlers
vi.mock('@/services/reports/components/sectionHandlers', () => ({
  addSection: vi.fn().mockReturnValue(30) // Mock return value
}));

describe('mediaHandlers', () => {
  let doc: jsPDF;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    doc = new jsPDF();
    mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockClear();
    vi.clearAllMocks();
  });

  describe('addPhotos', () => {
    it('should add photos section and process photos', async () => {
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10))
      };
      mockFetch.mockResolvedValue(mockResponse);

      const photos = ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'];
      const initialYPos = 50;

      await addPhotos(doc, photos, initialYPos);
      
      expect(addSection).toHaveBeenCalledWith(doc, "Photos d'Intervention", initialYPos);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(doc.addImage).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const photos = ['http://example.com/photo1.jpg'];
      const initialYPos = 50;

      await addPhotos(doc, photos, initialYPos);
      
      expect(addSection).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(doc.setFillColor).toHaveBeenCalled();
      expect(doc.rect).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalledWith('Image non disponible', expect.any(Number), expect.any(Number), expect.any(Object));
    });

    it('should add a new page if close to bottom', async () => {
      mockFetch.mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10))
      });

      const photos = ['http://example.com/photo1.jpg'];
      const pageHeight = doc.internal.pageSize.getHeight();
      const initialYPos = pageHeight - 60; // Close to bottom

      await addPhotos(doc, photos, initialYPos);
      
      expect(doc.addPage).toHaveBeenCalled();
    });
  });

  describe('addSignature', () => {
    it('should add signature section and signature image', async () => {
      const signature = 'data:image/png;base64,abcdef';
      const initialYPos = 50;

      await addSignature(doc, signature, initialYPos);
      
      expect(addSection).toHaveBeenCalledWith(doc, 'Signature du technicien', initialYPos);
      expect(doc.addImage).toHaveBeenCalled();
    });

    it('should add a new page if close to bottom', async () => {
      const signature = 'data:image/png;base64,abcdef';
      const pageHeight = doc.internal.pageSize.getHeight();
      const initialYPos = pageHeight - 40; // Close to bottom

      await addSignature(doc, signature, initialYPos);
      
      expect(doc.addPage).toHaveBeenCalled();
      expect(addSection).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const signature = 'invalid-signature-data';
      const initialYPos = 50;
      
      // Make addImage throw an error
      (doc.addImage as any).mockImplementation(() => {
        throw new Error('Invalid image data');
      });

      await addSignature(doc, signature, initialYPos);
      
      // Function should complete without throwing
      expect(addSection).toHaveBeenCalled();
    });
  });
});
