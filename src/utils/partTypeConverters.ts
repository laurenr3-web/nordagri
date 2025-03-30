
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
  return {
    id: part.id,
    name: part.name || '',
    reference: part.reference || '',
    partNumber: part.partNumber || '',
    description: part.description || '',
    category: part.category || '',
    manufacturer: part.manufacturer || '',
    compatibleWith: Array.isArray(part.compatibleWith) ? part.compatibleWith : [],
    compatibility: Array.isArray(part.compatibility) ? part.compatibility : [],
    inStock: !!part.inStock,
    quantity: part.quantity,
    minimumStock: part.minimumStock,
    location: part.location || '',
    lastUsed: part.lastUsed,
    purchasePrice: part.purchasePrice,
    estimatedPrice: part.estimatedPrice,
    isFromSearch: part.isFromSearch,
    imageUrl: part.imageUrl,
    stock: part.stock || 0,
    price: part.price || 0,
    reorderPoint: part.reorderPoint || 0,
    image: part.image || ''
  };
};

// Fonction pour convertir LocalPart vers Part
export const convertToPart = (localPart: LocalPart): Part => {
  // Conversion explicite vers le type Part
  return {
    id: typeof localPart.id === 'string' ? parseInt(localPart.id, 10) : localPart.id as number,
    name: localPart.name,
    partNumber: localPart.partNumber || (localPart.reference || ''),
    category: localPart.category,
    compatibility: Array.isArray(localPart.compatibility) ? localPart.compatibility : [],
    manufacturer: localPart.manufacturer,
    price: localPart.price,
    stock: localPart.stock,
    location: localPart.location,
    reorderPoint: localPart.reorderPoint,
    image: localPart.image,
    description: localPart.description,
    reference: localPart.reference,
    compatibleWith: Array.isArray(localPart.compatibleWith) ? localPart.compatibleWith : [],
    estimatedPrice: localPart.estimatedPrice,
    inStock: localPart.inStock,
    isFromSearch: localPart.isFromSearch,
    imageUrl: localPart.imageUrl
  };
};
