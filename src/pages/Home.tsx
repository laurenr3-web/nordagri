
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Tractor, 
  Wrench, // Changed from Tool to Wrench
  Calendar, 
  ClipboardList,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react';
import AuthDebugger from '@/components/auth/AuthDebugger';

const Home = () => {
  const { isAuthenticated, signOut, loading } = useAuthContext();

  const menuItems = [
    {
      title: 'Équipements',
      description: 'Gérer votre parc de machines',
      icon: <Tractor className="h-8 w-8 text-primary" />,
      path: '/equipment',
      requireAuth: true
    },
    {
      title: 'Pièces',
      description: 'Gérer l\'inventaire des pièces',
      icon: <Wrench className="h-8 w-8 text-primary" />, // Changed from Tool to Wrench
      path: '/parts',
      requireAuth: true
    },
    {
      title: 'Maintenance',
      description: 'Planifier et suivre les entretiens',
      icon: <Calendar className="h-8 w-8 text-primary" />,
      path: '/maintenance',
      requireAuth: true
    },
    {
      title: 'Interventions',
      description: 'Gérer les interventions techniques',
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      path: '/interventions',
      requireAuth: true
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre compte et préférences',
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      path: '/settings',
      requireAuth: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">OptiTractor</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plateforme de gestion des équipements, pièces et maintenance agricole
        </p>
      </header>

      {!isAuthenticated && (
        <div className="mb-8">
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-medium text-lg">Vous n'êtes pas connecté</h3>
                  <p className="text-muted-foreground">
                    L'accès à certaines fonctionnalités requiert une authentification
                  </p>
                </div>
                <Button asChild className="ml-auto">
                  <Link to="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isAuthenticated && (
        <div className="mb-8 flex justify-end">
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.path} className={item.requireAuth && !isAuthenticated ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                {item.icon}
                {item.requireAuth && !isAuthenticated && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    Connexion requise
                  </span>
                )}
              </div>
              <CardTitle className="mt-4">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                variant={item.requireAuth && !isAuthenticated ? "outline" : "default"}
                className="w-full"
                disabled={item.requireAuth && !isAuthenticated}
              >
                <Link to={item.path}>
                  Accéder
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <AuthDebugger />
      </div>
    </div>
  );
};

export default Home;
