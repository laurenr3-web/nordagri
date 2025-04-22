
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import ProfileDisplay from './ProfileDisplay';
import ProfileEditDialog from './ProfileEditDialog';

export const ProfileSection = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        setUser(data.session.user);
        setProfileEmail(data.session.user.email || '');
        fetchProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setProfileEmail(session.user.email || '');
          fetchProfile(session.user.id);
        } else {
          setProfileName('');
          setProfileEmail('');
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
        setProfileName(fullName || 'New User');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Split the full name into first and last name
      const nameParts = profileName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection 
      title="Profile & Account" 
      description="Manage your personal information and account settings"
    >
      <ProfileDisplay 
        loading={loading}
        name={profileName}
        email={profileEmail}
        onEdit={() => setProfileDialogOpen(true)}
      />
      <ProfileEditDialog 
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        name={profileName}
        setName={setProfileName}
        email={profileEmail}
        loading={loading}
        onSave={handleProfileUpdate}
      />
    </SettingsSection>
  );
};

