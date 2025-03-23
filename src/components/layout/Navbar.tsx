
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { 
  Home, 
  Tractor, 
  Tool, 
  Wrench, 
  AlertTriangle, 
  Map, 
  Settings as SettingsIcon, 
  Menu, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: <Home />, label: "Dashboard" },
    { path: "/equipment", icon: <Tractor />, label: "Equipment" },
    { path: "/parts", icon: <Tool />, label: "Parts" },
    { path: "/maintenance", icon: <Wrench />, label: "Maintenance" },
    { path: "/interventions", icon: <AlertTriangle />, label: "Interventions" },
    { path: "/optifield", icon: <Map />, label: "OptiField" },
    { path: "/settings", icon: <SettingsIcon />, label: "Settings" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 px-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">OptiTractor</Link>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 bg-background z-40 overflow-auto">
          <div className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out hidden md:block",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">OptiTractor</span>
          </Link>
        </div>
        <div className="px-3 py-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <UserMenu />
        </div>
      </aside>

      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-md md:hidden"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
    </>
  );
};

export default Navbar;
