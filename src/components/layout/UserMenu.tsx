
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/AuthProvider";

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, profileData, isAuthenticated, loading, signOut } = useAuthContext();

  const getInitials = () => {
    if (profileData?.first_name || profileData?.last_name) {
      const firstInitial = profileData.first_name ? profileData.first_name[0] : '';
      const lastInitial = profileData.last_name ? profileData.last_name[0] : '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  const handleLogout = async () => {
    try {
      console.log(`Tentative de déconnexion: ${new Date().toISOString()}`);
      
      await signOut();
      
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      toast.error(error.message || 'Déconnexion échouée');
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
        Connexion
      </Button>
    );
  }

  const displayName = profileData 
    ? [profileData.first_name, profileData.last_name].filter(Boolean).join(' ') 
    : user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {profileData?.avatar_url ? (
              <AvatarImage src={profileData.avatar_url} alt={displayName || 'Utilisateur'} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName || 'Utilisateur'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
