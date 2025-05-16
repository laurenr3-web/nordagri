
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsPDF } from 'jspdf';
import { addHeader, addFooter } from '@/services/reports/components/documentElements';
import { InterventionReportOptions } from '@/services/reports/types/interventionReportTypes';

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
      setDrawColor: vi.fn(),
      setLineWidth: vi.fn(),
      line: vi.fn(),
      setPage: vi.fn(),
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297
        },
        getNumberOfPages: () => 3
      }
    }))
  };
});

describe('documentElements', () => {
  let doc: jsPDF;
  let mockFetch: any;
  let options: InterventionReportOptions;

  beforeEach(() => {
    doc = new jsPDF();
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();
    vi.clearAllMocks();
    
    options = {
      farmName: 'Test Farm',
      farmLogo: 'http://example.com/logo.png',
      contactInfo: {
        phone: '123-456-7890',
        email: 'contact@testfarm.com',
        address: '123 Farm Road'
      },
      includeContact: true
    };
  });

  describe('addHeader', () => {
    it('should add header with logo when farmLogo is provided', async () => {
      mockFetch.mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10))
      });

      const initialYPos = 15;
      const result = await addHeader(doc, options, initialYPos);
      
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/logo.png');
      expect(doc.addImage).toHaveBeenCalled();
      expect(doc.setFontSize).toHaveBeenCalledWith(12);
      expect(doc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(doc.text).toHaveBeenCalledWith('Test Farm', expect.any(Number), expect.any(Number), expect.any(Object));
      expect(result).toBe(initialYPos + 30);
    });

    it('should add header without logo when farmLogo is not provided', async () => {
      const optionsNoLogo = { ...options, farmLogo: undefined };
      const initialYPos = 15;
      
      const result = await addHeader(doc, optionsNoLogo, initialYPos);
      
      expect(mockFetch).not.toHaveBeenCalled();
      expect(doc.addImage).not.toHaveBeenCalled();
      expect(doc.setFontSize).toHaveBeenCalledWith(16);
      expect(doc.text).toHaveBeenCalledWith('Test Farm', expect.any(Number), expect.any(Number), expect.any(Object));
      expect(result).toBe(initialYPos + 20);
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const initialYPos = 15;
      
      const result = await addHeader(doc, options, initialYPos);
      
      expect(mockFetch).toHaveBeenCalled();
      expect(doc.addImage).not.toHaveBeenCalled();
      expect(result).toBe(initialYPos + 10);
    });
  });

  describe('addFooter', () => {
    it('should add footer to all pages', () => {
      addFooter(doc, options);
      
      // Should call setPage for each page
      expect(doc.setPage).toHaveBeenCalledTimes(3);
      expect(doc.setDrawColor).toHaveBeenCalledWith(200, 200, 200);
      expect(doc.setLineWidth).toHaveBeenCalledWith(0.5);
      expect(doc.line).toHaveBeenCalledTimes(3);
      expect(doc.text).toHaveBeenCalledWith(expect.stringContaining('Test Farm'), expect.any(Number), expect.any(Number), expect.any(Object));
    });

    it('should not include contact info when includeContact is false', () => {
      const optionsNoContact = { ...options, includeContact: false };
      
      addFooter(doc, optionsNoContact);
      
      // Should only add page numbers, not contact text
      expect(doc.text).toHaveBeenCalledWith(expect.stringContaining('Page'), expect.any(Number), expect.any(Number), expect.any(Object));
      expect(doc.text).not.toHaveBeenCalledWith(expect.stringContaining('Test Farm'), expect.any(Number), expect.any(Number), expect.any(Object));
    });
  });
});
