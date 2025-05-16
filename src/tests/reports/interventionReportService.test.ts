
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interventionReportService } from '@/services/reports/interventionReportService';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { Intervention } from '@/types/Intervention';

// Mock dependencies
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

vi.mock('@/services/reports/generators/pdfGenerator', () => ({
  generateReport: vi.fn().mockResolvedValue(new Blob(['mock-pdf-content']))
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ error: null })
    }
  }
}));

vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('20250501')
}));

describe('interventionReportService', () => {
  let mockIntervention: Intervention;
  
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

    // Mock FileReader for base64 conversion
    vi.spyOn(global, 'FileReader').mockImplementation(() => ({
      readAsDataURL: vi.fn(function(this: any) {
        setTimeout(() => {
          this.onloadend?.({
            target: { result: 'data:application/pdf;base64,dGVzdCBkYXRh' }
          });
        }, 10);
      }),
      result: 'data:application/pdf;base64,dGVzdCBkYXRh'
    } as any));
  });

  describe('downloadReport', () => {
    it('should generate and download the report', async () => {
      await interventionReportService.downloadReport(mockIntervention);
      
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        `intervention_1_20250501.pdf`
      );
    });

    it('should handle errors during download', async () => {
      const mockGenerateReport = vi.fn().mockRejectedValue(new Error('Generation failed'));
      vi.spyOn(interventionReportService, 'generateReport').mockImplementation(mockGenerateReport);
      
      await expect(interventionReportService.downloadReport(mockIntervention))
        .rejects.toThrow('Generation failed');
    });
  });

  describe('sendReportByEmail', () => {
    it('should generate and send the report by email', async () => {
      const result = await interventionReportService.sendReportByEmail(
        mockIntervention,
        'test@example.com',
        'Test Report',
        'Please find attached report'
      );
      
      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-intervention-report', {
        body: expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Report',
          message: 'Please find attached report',
          fileName: `intervention_1_20250501.pdf`,
          interventionId: 1
        })
      });
    });

    it('should use default subject and message when not provided', async () => {
      await interventionReportService.sendReportByEmail(mockIntervention, 'test@example.com');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-intervention-report', {
        body: expect.objectContaining({
          subject: expect.stringContaining('Rapport d\'intervention #1'), 
          message: expect.stringContaining('Veuillez trouver ci-joint')
        })
      });
    });

    it('should handle Supabase function errors', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ 
        error: { message: 'Function error', status: 500 } 
      } as any);
      
      const result = await interventionReportService.sendReportByEmail(
        mockIntervention,
        'test@example.com'
      );
      
      expect(result).toBe(false);
    });

    it('should handle FileReader errors', async () => {
      vi.spyOn(global, 'FileReader').mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          setTimeout(() => this.onerror?.(new Error('Read error')), 10);
        }),
      } as any));
      
      const result = await interventionReportService.sendReportByEmail(
        mockIntervention,
        'test@example.com'
      );
      
      expect(result).toBe(false);
    });
  });
});
