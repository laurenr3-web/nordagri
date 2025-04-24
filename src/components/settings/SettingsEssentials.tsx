
import React, { useState, useEffect } from 'react';
import { ProfileSection } from './profile/ProfileSection';
import { LanguageSection } from './regional/LanguageSection';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from '@/providers/AuthProvider';

export function SettingsEssentials() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'fr' // langue par défaut
  });
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Récupérer le profil utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, language')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUserData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: user.email || '',
        language: data.language || 'fr'
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      toast.error('Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    if (!user?.id) return false;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUserData(prev => ({
        ...prev,
        firstName,
        lastName
      }));
      
      toast.success('Profil mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Impossible de mettre à jour le profil');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateLanguage = async (language: string) => {
    if (!user?.id) return false;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUserData(prev => ({
        ...prev,
        language
      }));
      
      toast.success('Préférence de langue mise à jour');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la langue:', error);
      toast.error('Impossible de mettre à jour la langue');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <ProfileSection 
        firstName={userData.firstName}
        lastName={userData.lastName}
        email={userData.email}
        loading={loading}
        onUpdateProfile={handleUpdateProfile}
      />
      
      <LanguageSection 
        currentLanguage={userData.language}
        loading={loading}
        onUpdateLanguage={handleUpdateLanguage}
      />
    </div>
  );
}
