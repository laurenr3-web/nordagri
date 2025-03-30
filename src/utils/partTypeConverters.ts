
import { Part } from '@/types/Part';
import { assertIsString, assertIsNumber, assertIsArray, assertIsObject } from '@/utils/typeAssertions';

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

// Fonction pour convertir Part vers LocalPart avec assertions de type
export const convertToLocalPart = (part: unknown): LocalPart => {
  // S'assurer que part est bien un objet
  const typedPart = assertIsObject(part);
  
  return {
    id: typedPart.id ?? 0,
    name: assertIsString(typedPart.name ?? ''),
    reference: typedPart.reference as string | undefined ?? '',
    partNumber: assertIsString(typedPart.partNumber ?? ''),
    description: typedPart.description as string | undefined ?? '',
    category: assertIsString(typedPart.category ?? ''),
    manufacturer: assertIsString(typedPart.manufacturer ?? ''),
    compatibleWith: Array.isArray(typedPart.compatibleWith) ? typedPart.compatibleWith : [],
    compatibility: Array.isArray(typedPart.compatibility) ? typedPart.compatibility : [],
    inStock: !!typedPart.inStock,
    quantity: typeof typedPart.quantity === 'number' ? typedPart.quantity : undefined,
    minimumStock: typeof typedPart.minimumStock === 'number' ? typedPart.minimumStock : undefined,
    location: assertIsString(typedPart.location ?? ''),
    lastUsed: typedPart.lastUsed as Date | null | undefined,
    purchasePrice: typeof typedPart.purchasePrice === 'number' ? typedPart.purchasePrice : undefined,
    estimatedPrice: typeof typedPart.estimatedPrice === 'number' ? typedPart.estimatedPrice : null,
    isFromSearch: !!typedPart.isFromSearch,
    imageUrl: typedPart.imageUrl as string | null | undefined,
    stock: Number(typedPart.stock ?? 0),
    price: Number(typedPart.price ?? 0),
    reorderPoint: Number(typedPart.reorderPoint ?? 0),
    image: assertIsString(typedPart.image ?? '')
  };
};

// Fonction pour convertir LocalPart vers Part avec assertions de type
export const convertToPart = (localPart: unknown): Part => {
  // S'assurer que localPart est bien un objet
  const typedPart = assertIsObject(localPart);
  
  // Conversion de l'ID avec vérification de type
  const rawId = typedPart.id;
  const id = typeof rawId === 'string' ? parseInt(rawId, 10) : (typeof rawId === 'number' ? rawId : 0);
  
  // Conversion explicite vers le type Part
  return {
    id: assertIsNumber(id),
    name: assertIsString(typedPart.name ?? ''),
    partNumber: assertIsString(typedPart.partNumber ?? ''),
    category: assertIsString(typedPart.category ?? ''),
    compatibility: assertIsArray<string>(Array.isArray(typedPart.compatibility) ? typedPart.compatibility : []),
    manufacturer: assertIsString(typedPart.manufacturer ?? ''),
    price: assertIsNumber(Number(typedPart.price ?? 0)),
    stock: assertIsNumber(Number(typedPart.stock ?? 0)),
    location: assertIsString(typedPart.location ?? ''),
    reorderPoint: assertIsNumber(Number(typedPart.reorderPoint ?? 0)),
    image: assertIsString(typedPart.image ?? ''),
    description: typedPart.description as string | undefined,
    reference: typedPart.reference as string | undefined,
    compatibleWith: Array.isArray(typedPart.compatibleWith) ? typedPart.compatibleWith : [],
    estimatedPrice: typeof typedPart.estimatedPrice === 'number' ? typedPart.estimatedPrice : undefined,
    inStock: !!typedPart.inStock,
    isFromSearch: !!typedPart.isFromSearch,
    imageUrl: typedPart.imageUrl as string | null | undefined
  };
};
