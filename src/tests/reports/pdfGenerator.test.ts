
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsPDF } from 'jspdf';
import { generateReport } from '@/services/reports/generators/pdfGenerator';
import { addHeader, addFooter } from '@/services/reports/components/documentElements';
import { addPhotos, addSignature } from '@/services/reports/components/mediaHandlers';
import { addSection } from '@/services/reports/components/sectionHandlers';
import { Intervention } from '@/types/Intervention';
import { InterventionReportOptions } from '@/services/reports/types/interventionReportTypes';

// Mock dependencies
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['mock-pdf-content'])),
    splitTextToSize: vi.fn().mockReturnValue(['Line 1', 'Line 2']),
    autoTable: vi.fn().mockImplementation(() => {
      return {
        lastAutoTable: { finalY: 100 }
      };
    }),
    lastAutoTable: { finalY: 100 },
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      },
      getNumberOfPages: () => 1
    }
  }))
}));

vi.mock('@/services/reports/components/documentElements', () => ({
  addHeader: vi.fn().mockResolvedValue(30),
  addFooter: vi.fn()
}));

vi.mock('@/services/reports/components/mediaHandlers', () => ({
  addPhotos: vi.fn().mockResolvedValue(150),
  addSignature: vi.fn().mockResolvedValue(200)
}));

vi.mock('@/services/reports/components/sectionHandlers', () => ({
  addSection: vi.fn().mockReturnValue(40)
}));

vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('01/05/2025')
}));

vi.mock('date-fns/locale', () => ({
  fr: {}
}));

describe('pdfGenerator', () => {
  let mockIntervention: Intervention;
  let options: InterventionReportOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockIntervention = {
      id: 1,
      title: 'Test Intervention',
      equipment: 'Test Equipment',
      equipmentId: 10,
      location: 'Test Location',
      coordinates: { lat: 45, lng: 3 },
      status: 'completed',
      priority: 'high',
      date: '2025-05-01',
      technician: 'Test Technician',
      description: 'Test description of the intervention',
      notes: 'Work completed successfully',
      partsUsed: [
        { partId: 1, name: 'Test Part', quantity: 2 }
      ]
    };
    
    options = {
      farmName: 'Test Farm',
      includeSignature: true,
      includePhotos: true,
      includeParts: true
    };
  });

  describe('generateReport', () => {
    it('should generate a PDF report with all sections', async () => {
      const signature = 'data:image/png;base64,test-signature';
      const photos = ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'];
      
      const result = await generateReport(mockIntervention, signature, photos, options);
      
      expect(result).toBeInstanceOf(Blob);
      expect(addHeader).toHaveBeenCalled();
      expect(addSection).toHaveBeenCalledTimes(expect.any(Number));
      expect(addPhotos).toHaveBeenCalledWith(expect.any(Object), photos, expect.any(Number));
      expect(addSignature).toHaveBeenCalledWith(expect.any(Object), signature, expect.any(Number));
      expect(addFooter).toHaveBeenCalled();
    });

    it('should not include photos if includePhotos is false', async () => {
      const optionsNoPhotos = { ...options, includePhotos: false };
      const signature = 'data:image/png;base64,test-signature';
      const photos = ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'];
      
      await generateReport(mockIntervention, signature, photos, optionsNoPhotos);
      
      expect(addPhotos).not.toHaveBeenCalled();
    });

    it('should not include signature if includeSignature is false', async () => {
      const optionsNoSignature = { ...options, includeSignature: false };
      const signature = 'data:image/png;base64,test-signature';
      const photos = ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'];
      
      await generateReport(mockIntervention, signature, photos, optionsNoSignature);
      
      expect(addSignature).not.toHaveBeenCalled();
    });

    it('should not include parts if includeParts is false or partsUsed is empty', async () => {
      const optionsNoParts = { ...options, includeParts: false };
      const signature = 'data:image/png;base64,test-signature';
      
      // Test with includeParts=false
      await generateReport(mockIntervention, signature, [], optionsNoParts);
      
      const autoTableCalls = (jsPDF as unknown as jest.Mock).mock.results[0].value.autoTable.mock.calls;
      expect(autoTableCalls.length).toBe(1); // Only the equipment section, not parts
      
      // Reset and test with empty partsUsed
      vi.clearAllMocks();
      const interventionNoParts = { ...mockIntervention, partsUsed: [] };
      
      await generateReport(interventionNoParts, signature, [], options);
      
      const autoTableCallsAfter = (jsPDF as unknown as jest.Mock).mock.results[0].value.autoTable.mock.calls;
      expect(autoTableCallsAfter.length).toBe(1); // Only the equipment section
    });

    it('should handle errors gracefully', async () => {
      // Make jsPDF throw an error
      (jsPDF as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('PDF generation error');
      });
      
      await expect(generateReport(mockIntervention, '', [], options)).rejects.toThrow('PDF generation error');
    });
  });
});
