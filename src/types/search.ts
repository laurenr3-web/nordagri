
export interface SearchItem {
  id: number | string;
  title: string;
  subtitle: string;
  type: 'equipment' | 'intervention' | 'part' | 'task';
  url: string;
}
