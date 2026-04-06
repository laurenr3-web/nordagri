
import { supabase } from '@/integrations/supabase/client';
import type { TeamMember, PendingInvitation } from '@/types/TeamMember';

/**
 * Fetches all team data for a farm:
 * - Owner from farms.owner_id
 * - Members from farm_members
 * - Pending invitations
 */
export async function fetchTeamData(farmId: string) {
  const members: TeamMember[] = [];

  // 1. Get farm owner
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('owner_id')
    .eq('id', farmId)
    .single();

  if (farmError) {
    console.error('Error fetching farm:', farmError);
    throw farmError;
  }

  if (farm?.owner_id) {
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('id', farm.owner_id)
      .single();

    if (ownerProfile) {
      members.push({
        id: ownerProfile.id,
        user_id: ownerProfile.id,
        email: '',
        first_name: ownerProfile.first_name || '',
        last_name: ownerProfile.last_name || '',
        role: 'owner',
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }
  }

  // 2. Get farm members
  const { data: farmMembers, error: membersError } = await supabase
    .from('farm_members')
    .select('id, user_id, role, created_at')
    .eq('farm_id', farmId);

  if (!membersError && farmMembers && farmMembers.length > 0) {
    const userIds = farmMembers.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, p])
    );

    for (const member of farmMembers) {
      const profile = profileMap.get(member.user_id);
      members.push({
        id: member.id,
        user_id: member.user_id,
        email: '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: member.role || 'member',
        status: 'active',
        created_at: member.created_at || new Date().toISOString(),
      });
    }
  }

  // Deduplicate by user_id (owner takes priority)
  const uniqueMembers = Array.from(
    new Map(members.map(m => [m.user_id, m])).values()
  );

  // 3. Get pending invitations
  const invitations = await fetchPendingInvitations(farmId);

  return { teamMembers: uniqueMembers, invitations };
}

/**
 * Fetches pending invitations for a farm
 */
export async function fetchPendingInvitations(farmId: string): Promise<PendingInvitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('farm_id', farmId)
    .neq('status', 'accepted');

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }

  return (data || []).map(invite => ({
    id: invite.id || '',
    email: invite.email || '',
    role: invite.role || '',
    status: invite.status || '',
    created_at: invite.created_at || '',
    expires_at: invite.expires_at,
  }));
}

/**
 * Cancels an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId);

  if (error) throw error;
  return true;
}

/**
 * Resends an invitation (placeholder)
 */
export async function resendInvitation(invitationId: string): Promise<boolean> {
  console.log('Resending invitation:', invitationId);
  return true;
}
