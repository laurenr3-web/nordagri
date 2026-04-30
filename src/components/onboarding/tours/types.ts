export type TourName = 'welcome' | 'equipment' | 'maintenance';

export const VALID_TOURS: ReadonlyArray<TourName> = ['welcome', 'equipment', 'maintenance'];

export interface TourTexts {
  [key: string]: string;
}

export const isTourName = (value: unknown): value is TourName =>
  typeof value === 'string' && (VALID_TOURS as ReadonlyArray<string>).includes(value);
