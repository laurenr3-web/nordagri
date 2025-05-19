
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { TimeReportPDFProps, TimeEntriesPDFProps } from './types';
import { TimeReportPDF } from '@/components/time-tracking/reports/TimeReportPDF';
import { TimeEntriesPDF } from '@/components/time-tracking/reports/TimeEntriesPDF';

/**
 * Generate and download a PDF report of time tracking summary
 */
export const exportTimeReportToPDF = async (
  month: string,
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  },
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage?: number;
  }>,
  topEquipment: Array<{
    id?: number;
    name: string;
    hours: number;
  }>,
  filename: string = 'time-report'
): Promise<void> => {
  try {
    console.log("Creating time report PDF with data:", {
      month,
      summary,
      taskDistributionLength: taskDistribution.length,
      topEquipmentLength: topEquipment.length
    });

    // Generate PDF document
    const blob = await pdf(
      <TimeReportPDF
        month={month}
        summary={summary}
        taskDistribution={taskDistribution}
        topEquipment={topEquipment}
      />
    ).toBlob();

    console.log(`PDF blob created, size: ${blob.size}`);
    
    // Download the PDF file
    saveAs(blob, `${filename}.pdf`);
    console.log(`PDF download initiated: ${filename}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error generating time report PDF:", error);
    throw error;
  }
};

/**
 * Generate and download a PDF of time entries
 */
export const exportTimeEntriesToPDF = async (
  props: TimeEntriesPDFProps,
  filename: string = 'time-entries'
): Promise<void> => {
  try {
    console.log("Creating time entries PDF");

    // Generate PDF document
    const blob = await pdf(
      <TimeEntriesPDF
        title={props.title}
        subtitle={props.subtitle}
        tableData={props.tableData}
      />
    ).toBlob();
    
    console.log(`PDF blob created, size: ${blob.size}`);
    
    // Download the PDF file
    saveAs(blob, `${filename}.pdf`);
    console.log(`PDF download initiated: ${filename}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error generating time entries PDF:", error);
    throw error;
  }
};
