
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMember } from './TeamMember';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InviteUserDialog } from './InviteUserDialog';

interface TeamMemberType {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export const UserManagementSection = () => {
  // State for user management dialog
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('administrator'); // Valeur par défaut non vide
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // State for team member edit dialog
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberType | null>(null);

  // Team members data
  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [noFarmAlert, setNoFarmAlert] = useState(false);

  // Add this new state for the invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First get the current user's session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          setLoading(false);
          return;
        }
        
        // Get the user's farm
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('id')
          .eq('owner_id', sessionData.session.user.id)
          .maybeSingle();
          
        if (farmError) throw farmError;
        
        if (!farmData) {
          setNoFarmAlert(true);
          setLoading(false);
          return;
        }
        
        setFarmId(farmData.id);
        setNoFarmAlert(false);
        
        // Now get the team members for this farm
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('farm_id', farmData.id);
          
        if (teamError) throw teamError;
        
        setTeamMembers(teamData || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const authStateChange = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => {
      authStateChange.data.subscription.unsubscribe();
    };
  }, []);

  // Handle add user
  const handleAddUser = async () => {
    if (!farmId) {
      toast.error('Please save farm information first');
      return;
    }
    
    if (!newUserName || !newUserRole) {
      toast.error('Name and role are required');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          farm_id: farmId,
          name: newUserName,
          role: newUserRole,
          email: newUserEmail || null,
          phone: newUserPhone || null
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        setTeamMembers([...teamMembers, ...data]);
        resetNewUserForm();
        setAddUserDialogOpen(false);
        toast.success('Team member added successfully');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const resetNewUserForm = () => {
    setNewUserName('');
    setNewUserRole('administrator'); // Valeur par défaut non vide
    setNewUserEmail('');
    setNewUserPhone('');
  };

  // Handle edit team member
  const handleEditTeamMember = async () => {
    if (!editingTeamMember) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('team_members')
        .update({
          name: editingTeamMember.name,
          role: editingTeamMember.role,
          email: editingTeamMember.email || null,
          phone: editingTeamMember.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTeamMember.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedTeamMembers = teamMembers.map(member => 
        member.id === editingTeamMember.id ? editingTeamMember : member
      );
      
      setTeamMembers(updatedTeamMembers);
      setEditTeamDialogOpen(false);
      toast.success('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      // Update local state
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      setEditTeamDialogOpen(false);
      toast.success('Team member removed');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="User Management & Permissions"
      description="Manage team members and their access levels"
    >
      {noFarmAlert ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please save your farm information before adding team members.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Team Members</h3>
              <Button 
                size="sm" 
                onClick={() => setInviteDialogOpen(true)} 
                disabled={loading || !farmId}
              >
                Add User
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                No team members added yet. Click "Add User" to get started.
              </div>
            ) : (
              <div className="rounded-md border divide-y">
                {teamMembers.map((member) => (
                  <TeamMember 
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    onEdit={() => {
                      setEditingTeamMember(member);
                      setEditTeamDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
      />

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input 
                id="user-name" 
                value={newUserName} 
                onChange={(e) => setNewUserName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="field_manager">Field Manager</SelectItem>
                  <SelectItem value="mechanic">Mechanic</SelectItem>
                  <SelectItem value="seasonal_worker">Seasonal Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email (optional)</Label>
              <Input 
                id="user-email" 
                type="email"
                value={newUserEmail} 
                onChange={(e) => setNewUserEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone (optional)</Label>
              <Input 
                id="user-phone" 
                value={newUserPhone} 
                onChange={(e) => setNewUserPhone(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      <Dialog open={editTeamDialogOpen} onOpenChange={setEditTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingTeamMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingTeamMember.name} 
                  onChange={(e) => setEditingTeamMember({...editingTeamMember, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editingTeamMember.role} 
                  onValueChange={(value) => setEditingTeamMember({...editingTeamMember, role: value})}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="field_manager">Field Manager</SelectItem>
                    <SelectItem value="mechanic">Mechanic</SelectItem>
                    <SelectItem value="seasonal_worker">Seasonal Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email (optional)</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editingTeamMember.email || ''} 
                  onChange={(e) => setEditingTeamMember({...editingTeamMember, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone (optional)</Label>
                <Input 
                  id="edit-phone" 
                  value={editingTeamMember.phone || ''} 
                  onChange={(e) => setEditingTeamMember({...editingTeamMember, phone: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button 
              variant="destructive" 
              onClick={() => editingTeamMember && handleDeleteTeamMember(editingTeamMember.id)}
              className="mt-3 sm:mt-0"
            >
              Delete
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditTeamDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditTeamMember}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
};
