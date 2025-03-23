
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  Package, 
  Hammer, 
  AlertTriangle, 
  Map,
  Settings as SettingsIcon,
  Menu,
  ChevronLeft
} from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";

// Create a navbar content component that uses the useSidebar hook
const NavbarContent = () => {
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getItemClassName = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
      active 
        ? "bg-accent text-accent-foreground" 
        : "hover:bg-muted"
    }`;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:transition-none`}>
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="mr-2 md:hidden"
        >
          <ChevronLeft />
        </Button>
        <Link to="/" className="font-semibold">
          OptiTractor
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Link to="/equipment" className={getItemClassName("/equipment")}>
            <Tractor className="mr-2 h-4 w-4" />
            Equipment
          </Link>
          <Link to="/parts" className={getItemClassName("/parts")}>
            <Package className="mr-2 h-4 w-4" />
            Parts
          </Link>
          <Link to="/maintenance" className={getItemClassName("/maintenance")}>
            <Hammer className="mr-2 h-4 w-4" />
            Maintenance
          </Link>
          <Link to="/interventions" className={getItemClassName("/interventions")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Interventions
          </Link>
          <Link to="/optifield" className={getItemClassName("/optifield")}>
            <Map className="mr-2 h-4 w-4" />
            OptiField
          </Link>
          <Link to="/settings" className={getItemClassName("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
      <div className="border-t p-4">
        <UserMenu />
      </div>
    </div>
  );
};

// The main Navbar component now ensures SidebarProvider exists
const Navbar = () => {
  return (
    <SidebarProvider>
      <NavbarContent />
    </SidebarProvider>
  );
};

export default Navbar;
