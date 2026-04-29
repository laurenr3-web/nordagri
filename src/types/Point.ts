export type PointType = 'animal' | 'equipement' | 'champ' | 'batiment' | 'autre';
export type PointPriority = 'critical' | 'important' | 'normal';
export type PointStatus = 'open' | 'watch' | 'resolved';
export type PointEventType = 'observation' | 'action' | 'verification' | 'note' | 'correction';

export interface Point {
  id: string;
  farm_id: string;
  type: PointType;
  entity_id: string | null;
  entity_label: string | null;
  title: string;
  priority: PointPriority;
  status: PointStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_event_at: string;
  resolved_at: string | null;
}

export interface PointEvent {
  id: string;
  point_id: string;
  event_type: PointEventType;
  note: string | null;
  photo_urls: string[];
  created_by: string;
  created_at: string;
}

export interface PointWithLastEvent extends Point {
  last_event_type?: PointEventType | null;
  last_event_note?: string | null;
}