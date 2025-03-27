
// Upload equipment image
export async function uploadEquipmentImage(file: File): Promise<string> {
  // TODO: Add storage bucket implementation
  // For now, return a placeholder
  console.log('Image upload would happen here for:', file.name);
  return 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop';
}

// Delete equipment image
export async function deleteEquipmentImage(path: string): Promise<void> {
  // TODO: Add storage bucket implementation
  console.log('Image deletion would happen here for:', path);
}
