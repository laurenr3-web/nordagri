
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsPDF } from 'jspdf';
import { addSection } from '@/services/reports/components/sectionHandlers';

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
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297
        }
      }
    }))
  };
});

describe('sectionHandlers', () => {
  let doc: jsPDF;
  const margin = 15;

  beforeEach(() => {
    doc = new jsPDF();
    vi.clearAllMocks();
  });

  describe('addSection', () => {
    it('should add a section title to the document', () => {
      const result = addSection(doc, 'Test Section', 50);
      
      expect(doc.setFillColor).toHaveBeenCalledWith(240, 240, 240);
      expect(doc.rect).toHaveBeenCalledWith(margin, 50, 210 - (margin * 2), 8, 'F');
      expect(doc.setFontSize).toHaveBeenCalledWith(11);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(doc.setTextColor).toHaveBeenCalledWith(60, 60, 60);
      expect(doc.text).toHaveBeenCalledWith('Test Section', margin + 4, 50 + 5.5);
      expect(result).toBe(50 + 12); // Initial position + 12
    });

    it('should add a new page if position is close to page bottom', () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      const yPos = pageHeight - 20; // Close to bottom
      
      const result = addSection(doc, 'Test Section Near Bottom', yPos);
      
      expect(doc.addPage).toHaveBeenCalled();
      expect(result).toBe(margin + 12);
    });

    it('should not add a new page if position is not close to page bottom', () => {
      const yPos = 100; // Not close to bottom
      
      addSection(doc, 'Test Section Not Near Bottom', yPos);
      
      expect(doc.addPage).not.toHaveBeenCalled();
    });
  });
});
