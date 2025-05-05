
// Types for team members and invitations
export interface TeamMember {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at?: string;
}

// Type for profile data from Supabase
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  farm_id?: string;
}
