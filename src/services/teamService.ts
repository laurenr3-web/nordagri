
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, PendingInvitation, UserProfile } from '@/types/TeamMember';
import { isValidProfile } from '@/utils/validationUtils';

/**
 * Fetches all team members for a farm
 */
export async function fetchTeamMembers(farmId: string): Promise<TeamMember[]> {
  // First get profiles associated with this farm
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, farm_id')
    .eq('farm_id', farmId);
  
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }
  
  let members: TeamMember[] = [];
  
  // Process profiles into team members
  if (profilesData && profilesData.length > 0) {
    members = profilesData
      .filter(isValidProfile)
      .map(profile => ({
        id: profile.id,
        user_id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: 'owner', // Default role
        status: 'active',
        created_at: new Date().toISOString()
      }));
    
    console.log("Found profiles associated with farm:", members);
  } else {
    console.log("No profiles found for this farm ID");
  }
  
  return members;
}

/**
 * Fetches additional team members from farm_members table if it exists
 */
export async function fetchFarmMembers(farmId: string): Promise<TeamMember[]> {
  try {
    const { data: farmMembersData, error: membersError } = await supabase
      .from('farm_members')
      .select('id, user_id, role, created_at')
      .eq('farm_id', farmId);
      
    if (membersError) {
      console.log("Note: farm_members table might not exist yet:", membersError);
      return [];
    }
    
    if (!farmMembersData || farmMembersData.length === 0) {
      return [];
    }
    
    console.log("Found farm members:", farmMembersData);
    
    const members: TeamMember[] = [];
    
    // For each member, get profile information
    for (const member of farmMembersData) {
      if (!member.user_id) continue;

      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', member.user_id)
          .single();
          
        if (userError) {
          console.error("Error fetching user data for member:", member.user_id, userError);
          continue;
        }
        
        // Verify userData exists and has required properties
        if (userData && typeof userData === 'object' && 'email' in userData) {
          const userInfo: TeamMember = {
            id: member.id || '',
            user_id: member.user_id || '',
            email: userData.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: member.role || 'viewer',
            status: 'active',
            created_at: member.created_at || new Date().toISOString()
          };
          
          members.push(userInfo);
        }
      } catch (error) {
        console.error("Error in member processing:", error);
      }
    }
    
    return members;
  } catch (error) {
    console.error("Error checking farm_members:", error);
    return [];
  }
}

/**
 * Fetches pending invitations for a farm
 */
export async function fetchPendingInvitations(farmId: string): Promise<PendingInvitation[]> {
  try {
    const { data: pendingInvites, error: invitesError } = await supabase
      .from('invitations')
      .select('*')
      .eq('farm_id', farmId)
      .neq('status', 'accepted');
    
    if (invitesError) {
      console.error("Error fetching invitations:", invitesError);
      return [];
    }
    
    if (!pendingInvites) {
      return [];
    }
    
    // Format the invitations
    const formattedInvitations: PendingInvitation[] = pendingInvites.map(invite => ({
      id: invite.id || '',
      email: invite.email || '',
      role: invite.role || '',
      status: invite.status || '',
      created_at: invite.created_at || '',
      expires_at: invite.expires_at
    }));
    
    console.log("Pending invitations:", formattedInvitations);
    return formattedInvitations;
  } catch (error) {
    console.error("Error processing invitations:", error);
    return [];
  }
}

/**
 * Handles cancellation of an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error canceling invitation:', error);
    throw error;
  }
}

/**
 * Resends an invitation (currently a simulation)
 */
export async function resendInvitation(invitationId: string): Promise<boolean> {
  // This is a placeholder for actual resend functionality
  console.log("Resending invitation:", invitationId);
  return true;
}

/**
 * Fetches all team data for a farm
 */
export async function fetchTeamData(farmId: string) {
  try {
    console.log("Fetching team data for farm ID:", farmId);
    
    // Get team members from profiles table
    const profileMembers = await fetchTeamMembers(farmId);
    
    // Get additional members from farm_members table if it exists
    const farmMembers = await fetchFarmMembers(farmId);
    
    // Combine all members
    let allMembers = [...profileMembers, ...farmMembers];
    
    // Remove duplicates (same user_id)
    const uniqueMembers = Array.from(
      new Map(allMembers.map(item => [item.user_id, item])).values()
    );
    
    // Get pending invitations
    const invitations = await fetchPendingInvitations(farmId);
    
    return {
      teamMembers: uniqueMembers,
      invitations
    };
  } catch (error) {
    console.error('Error loading team data:', error);
    throw error;
  }
}
