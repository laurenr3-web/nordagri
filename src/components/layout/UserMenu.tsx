
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
import { memo, useMemo } from "react";

export const UserMenu = memo(() => {
  const navigate = useNavigate();
  const { user, profileData, isAuthenticated, loading, signOut } = useAuthContext();

  // Use useMemo to avoid unnecessary recalculations of initials
  const initials = useMemo(() => {
    if (profileData?.first_name || profileData?.last_name) {
      const firstInitial = profileData.first_name ? profileData.first_name[0] : '';
      const lastInitial = profileData.last_name ? profileData.last_name[0] : '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }, [profileData?.first_name, profileData?.last_name, user?.email]);

  // Use useMemo for display name as well
  const displayName = useMemo(() => {
    if (profileData) {
      return [profileData.first_name, profileData.last_name].filter(Boolean).join(' ');
    }
    return user?.email;
  }, [profileData, user?.email]);

  const handleLogout = async () => {
    try {
      console.log(`Logout attempt: ${new Date().toISOString()}`);
      
      await signOut();
      
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Déconnexion échouée');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted">...</AvatarFallback>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileData?.avatar_url} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserMenu.displayName = "UserMenu";
