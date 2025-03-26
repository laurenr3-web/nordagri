
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut } from "lucide-react";
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
      // Log the logout attempt
      console.log(`Logout attempt: ${new Date().toISOString()}`);
      
      await signOut();
      
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Déconnexion échouée');
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
