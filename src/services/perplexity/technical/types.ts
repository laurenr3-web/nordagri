
export interface PartTechnicalInfo {
  function: string;
  compatibleEquipment: string[];
  installation: string;
  symptoms: string;
  maintenance: string;
  alternatives?: string[];
  warnings?: string;
}

export interface PerplexityTechnicalResponse {
  content: string;
  status: 'success' | 'error';
  error?: string;
}
