
import { User, Session } from '@supabase/supabase-js';

export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileData: ProfileData | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
}
