
import React, { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputWithSuffix } from '@/components/ui/input-with-suffix';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { User, Building, Users } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsEssentials = () => {
  // State for profile edit dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('John Doe');
  const [profileEmail, setProfileEmail] = useState('john.doe@example.com');

  // State for farm information
  const [farmName, setFarmName] = useState('Green Valley Farm');
  const [farmSize, setFarmSize] = useState('250');
  const [farmType, setFarmType] = useState('mixed');
  const [farmLocation, setFarmLocation] = useState('Bordeaux, France');

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

  // Handle profile update
  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully');
    setProfileDialogOpen(false);
  };

  // Handle farm information save
  const handleSaveFarmInfo = () => {
    toast.success('Farm information saved successfully');
  };

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
    <div className="space-y-6">
      <SettingsSection 
        title="Profile & Account" 
        description="Manage your personal information and account settings"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{profileName}</h3>
            <p className="text-sm text-muted-foreground">{profileEmail}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setProfileDialogOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Edit Dialog */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SettingsSection>

      <SettingsSection
        title="Farm Information"
        description="Details about your agricultural operation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm-name">Farm Name</Label>
                  <Input 
                    id="farm-name" 
                    value={farmName} 
                    onChange={(e) => setFarmName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm-size">Farm Size</Label>
                  <InputWithSuffix 
                    id="farm-size" 
                    value={farmSize} 
                    onChange={(e) => setFarmSize(e.target.value)} 
                    suffix="acres" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="farm-type">Farm Type</Label>
                  <Select 
                    value={farmType} 
                    onValueChange={setFarmType}
                  >
                    <SelectTrigger id="farm-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crops">Crop Farming</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="mixed">Mixed Farming</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm-location">Location</Label>
                  <Input 
                    id="farm-location" 
                    value={farmLocation} 
                    onChange={(e) => setFarmLocation(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleSaveFarmInfo}>Save Farm Information</Button>
        </div>
      </SettingsSection>

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
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingTeamMember(member);
                      setEditTeamDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
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

      <SettingsSection
        title="Regional Preferences"
        description="Configure units of measurement, currency, and date formats"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="units">Measurement Units</Label>
            <Select defaultValue="metric">
              <SelectTrigger id="units">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (km, kg, ha)</SelectItem>
                <SelectItem value="imperial">Imperial (mi, lb, acres)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="eur">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eur">Euro (€)</SelectItem>
                <SelectItem value="usd">US Dollar ($)</SelectItem>
                <SelectItem value="gbp">British Pound (£)</SelectItem>
                <SelectItem value="cad">Canadian Dollar (C$)</SelectItem>
                <SelectItem value="aud">Australian Dollar (A$)</SelectItem>
                <SelectItem value="jpy">Japanese Yen (¥)</SelectItem>
                <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
                <SelectItem value="cny">Chinese Yuan (¥)</SelectItem>
                <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                <SelectItem value="brl">Brazilian Real (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="dd/mm/yyyy">
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="nl">Nederlands</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="mt-4">Save Regional Preferences</Button>
      </SettingsSection>
    </div>
  );
};
