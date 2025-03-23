
export interface PartFormValues {
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  price: string;
  stock: string;
  reorderPoint: string;
  location: string;
  compatibility: string;
  image: string;
}

export interface AddPartFormProps {
  onSuccess?: (data: PartFormValues) => void;
  onCancel?: () => void;
}
