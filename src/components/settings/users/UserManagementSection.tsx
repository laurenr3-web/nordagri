
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMember } from './TeamMember';

export const UserManagementSection = () => {
  // State for user management dialog
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');

  // State for team member edit dialog
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState({ name: '', role: '' });

  // Team members data
  const [teamMembers, setTeamMembers] = useState([
    { name: 'John Doe', role: 'Administrator' },
    { name: 'Jane Smith', role: 'Field Manager' },
    { name: 'Robert Johnson', role: 'Mechanic' }
  ]);

  // Handle add user
  const handleAddUser = () => {
    if (newUserName && newUserRole) {
      setTeamMembers([...teamMembers, { name: newUserName, role: newUserRole }]);
      setNewUserName('');
      setNewUserRole('');
      setAddUserDialogOpen(false);
      toast.success('Team member added successfully');
    }
  };

  // Handle edit team member
  const handleEditTeamMember = () => {
    const updatedTeamMembers = teamMembers.map(member => 
      member.name === editingTeamMember.name ? { ...editingTeamMember } : member
    );
    setTeamMembers(updatedTeamMembers);
    setEditTeamDialogOpen(false);
    toast.success('Team member updated successfully');
  };

  return (
    <SettingsSection
      title="User Management & Permissions"
      description="Manage team members and their access levels"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Team Members</h3>
            <Button size="sm" onClick={() => setAddUserDialogOpen(true)}>Add User</Button>
          </div>
          <div className="rounded-md border divide-y">
            {teamMembers.map((member, index) => (
              <TeamMember 
                key={index}
                name={member.name}
                role={member.role}
                onEdit={() => {
                  setEditingTeamMember(member);
                  setEditTeamDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

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
              <Select onValueChange={setNewUserRole}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Field Manager">Field Manager</SelectItem>
                  <SelectItem value="Mechanic">Mechanic</SelectItem>
                  <SelectItem value="Seasonal Worker">Seasonal Worker</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Field Manager">Field Manager</SelectItem>
                  <SelectItem value="Mechanic">Mechanic</SelectItem>
                  <SelectItem value="Seasonal Worker">Seasonal Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeamDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTeamMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
};
