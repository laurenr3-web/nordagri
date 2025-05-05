
import { UserProfile } from "@/types/TeamMember";

/**
 * Type guard to verify if an object is a valid user profile
 */
export function isValidProfile(profile: any): profile is UserProfile {
  return (
    profile && 
    typeof profile === 'object' &&
    'id' in profile &&
    'email' in profile &&
    'first_name' in profile &&
    'last_name' in profile
  );
}

/**
 * Checks if a date string is expired compared to current date
 */
export function isDateExpired(dateString?: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}
