
import { Part } from '@/types/Part';

// Définition locale du type LocalPart pour éviter les conflits d'importation
export interface LocalPart {
  id: string | number;
  name: string;
  reference?: string;
  partNumber: string;
  description?: string;
  category: string;
  manufacturer: string;
  compatibleWith?: string[] | string;
  compatibility: string[];
  inStock?: boolean;
  quantity?: number;
  minimumStock?: number;
  location: string;
  lastUsed?: Date | null;
  purchasePrice?: number;
  estimatedPrice?: number | null;
  isFromSearch?: boolean;
  imageUrl?: string | null;
  stock: number;
  price: number;
  reorderPoint: number;
  image: string;
}

// Fonction pour convertir Part vers LocalPart
export const convertToLocalPart = (part: any): LocalPart => {
  console.log("Conversion Part -> LocalPart:", part?.name);
  
  return {
    id: part.id,
    name: part.name || '',
    reference: part.reference || part.partNumber || '',
    partNumber: part.partNumber || part.reference || '',
    description: part.description || '',
    category: part.category || '',
    manufacturer: part.manufacturer || '',
    compatibleWith: Array.isArray(part.compatibleWith) ? part.compatibleWith : 
                   Array.isArray(part.compatibility) ? part.compatibility : [],
    compatibility: Array.isArray(part.compatibility) ? part.compatibility : 
                  Array.isArray(part.compatibleWith) ? part.compatibleWith : [],
    inStock: !!part.inStock,
    quantity: part.quantity || part.stock || 0,
    minimumStock: part.minimumStock || part.reorderPoint || 0,
    location: part.location || '',
    lastUsed: part.lastUsed,
    purchasePrice: part.purchasePrice,
    estimatedPrice: part.estimatedPrice,
    isFromSearch: part.isFromSearch,
    imageUrl: part.imageUrl || part.image,
    stock: part.stock || part.quantity || 0,
    price: typeof part.price === 'number' ? part.price : parseFloat(String(part.price)) || 0,
    reorderPoint: part.reorderPoint || part.minimumStock || 0,
    image: part.image || part.imageUrl || ''
  };
};

// Fonction pour convertir LocalPart vers Part
export const convertToPart = (localPart: LocalPart): Part => {
  console.log("Conversion LocalPart -> Part:", localPart?.name);
  
  // Conversion explicite vers le type Part avec des valeurs par défaut pour éviter les erreurs
  return {
    id: typeof localPart.id === 'string' && !isNaN(parseInt(localPart.id)) ? 
        parseInt(localPart.id, 10) : localPart.id,
    name: localPart.name,
    partNumber: localPart.partNumber || (localPart.reference || ''),
    category: localPart.category || '',
    compatibility: Array.isArray(localPart.compatibility) ? localPart.compatibility : [],
    manufacturer: localPart.manufacturer || '',
    price: typeof localPart.price === 'number' ? localPart.price : parseFloat(String(localPart.price)) || 0,
    stock: localPart.stock || localPart.quantity || 0,
    location: localPart.location || '',
    reorderPoint: localPart.reorderPoint || localPart.minimumStock || 0,
    image: localPart.image || localPart.imageUrl || '',
    description: localPart.description || '',
    reference: localPart.reference || localPart.partNumber || '',
    compatibleWith: Array.isArray(localPart.compatibleWith) ? localPart.compatibleWith : 
                   Array.isArray(localPart.compatibility) ? localPart.compatibility : [],
    estimatedPrice: localPart.estimatedPrice || null,
    inStock: localPart.inStock || (localPart.stock > 0),
    isFromSearch: localPart.isFromSearch || false,
    imageUrl: localPart.imageUrl || localPart.image || null
  };
};
