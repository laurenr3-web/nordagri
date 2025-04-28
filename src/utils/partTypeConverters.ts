
import { Part } from '@/types/Part';
import { assertIsString, assertIsNumber, assertIsArray, assertIsObject } from '@/utils/typeAssertions';
import { compatibilityToNumbers } from '@/utils/compatibilityConverter';

// Local type definition to avoid import conflicts
export interface LocalPart {
  id: number;
  name: string;
  reference?: string;
  partNumber: string;
  description?: string;
  category: string;
  manufacturer: string;
  compatibleWith?: string[] | string;
  compatibility: number[]; // Changed to number[]
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

// Convert Part to LocalPart with type assertions
export const convertToLocalPart = (part: unknown): LocalPart => {
  // Ensure part is an object
  const typedPart = assertIsObject(part);
  
  // For ID, specifically ensure it's a number
  const id = typedPart.id;
  let safeId: number;
  if (typeof id === 'string') {
    safeId = parseInt(id, 10);
    if (isNaN(safeId)) {
      safeId = 0; // Fallback to 0 if parse fails
    }
  } else if (typeof id === 'number') {
    safeId = id;
  } else {
    safeId = 0; // Default value if neither string nor number
  }
  
  // Convert compatibility to number[]
  let compatibilityValue = typedPart.compatibility;
  let compatibility: number[] = [];
  
  if (compatibilityValue !== undefined) {
    compatibility = compatibilityToNumbers(compatibilityValue as string[] | number[]);
  }
  
  return {
    id: safeId,
    name: assertIsString(typedPart.name ?? ''),
    reference: typedPart.reference as string | undefined ?? '',
    partNumber: assertIsString(typedPart.partNumber ?? ''),
    description: typedPart.description as string | undefined ?? '',
    category: assertIsString(typedPart.category ?? ''),
    manufacturer: assertIsString(typedPart.manufacturer ?? ''),
    compatibleWith: Array.isArray(typedPart.compatibleWith) ? typedPart.compatibleWith : [],
    compatibility: compatibility,
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

// Convert LocalPart to Part with type assertions
export const convertToPart = (localPart: unknown): Part => {
  // Ensure localPart is an object
  const typedPart = assertIsObject(localPart);
  
  // Convert ID with type checking
  const rawId = typedPart.id;
  const id = typeof rawId === 'string' ? parseInt(rawId, 10) : (typeof rawId === 'number' ? rawId : 0);
  
  // Ensure compatibility is number[]
  let compatibilityValue = typedPart.compatibility;
  let compatibility: number[] = [];
  
  if (compatibilityValue !== undefined) {
    compatibility = compatibilityToNumbers(compatibilityValue as string[] | number[]);
  }
  
  // Explicit conversion to Part type
  return {
    id: isNaN(id) ? 0 : id, // Ensure id is always a valid number
    name: assertIsString(typedPart.name ?? ''),
    partNumber: assertIsString(typedPart.partNumber ?? ''),
    category: assertIsString(typedPart.category ?? ''),
    compatibility: compatibility,
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
