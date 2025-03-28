
import { fetchTechnicalInfo } from './api';
import { parseResponse } from './parser';
import { PartTechnicalInfo } from './types';

export async function getPartTechnicalInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
  const response = await fetchTechnicalInfo(partReference, partName);
  
  if (response.status === 'error') {
    throw new Error(response.error || "Une erreur est survenue lors de la récupération des informations");
  }
  
  return parseResponse(response.content);
}
