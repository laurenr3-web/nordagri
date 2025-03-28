
import { getPartTechnicalInfo } from './technical';
import type { PartTechnicalInfo } from './technical';

// Re-export pour rétrocompatibilité
export { PartTechnicalInfo };

export const partsTechnicalService = {
  async getPartInfo(partReference: string, partName?: string): Promise<PartTechnicalInfo> {
    return getPartTechnicalInfo(partReference, partName);
  }
};
