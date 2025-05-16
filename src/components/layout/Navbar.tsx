import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { NotificationCenter } from './NotificationCenter';
import { SyncIndicator } from './SyncIndicator';

const UserMenu: React.FC = () => {
  const { user, profileData, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t("auth.signedOut"),
        description: t("auth.signedOutSuccessfully"),
      });
      navigate('/login');
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        variant: "destructive",
        title: t("auth.signOutFailed"),
        description: t("auth.checkInternet"),
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileData?.avatar_url || user?.user_metadata?.avatar_url as string || ""} />
            <AvatarFallback>{profileData?.first_name?.[0]}{profileData?.last_name?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>{profileData?.first_name} {profileData?.last_name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("settings.title")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} >
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white border-b fixed top-0 left-0 right-0 z-30">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left section with logo and navigation links */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            NordAgri
          </Button>
        </div>
        
        {/* Right section with notifications and user menu */}
        <div className="flex items-center space-x-2">
          <SyncIndicator />
          <NotificationCenter />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
