
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Tractor, 
  Wrench,
  Calendar, 
  ClipboardList,
  LogIn,
  LogOut,
  AlertCircle,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import AuthDebugger from '@/components/auth/AuthDebugger';

const Home = () => {
  const { isAuthenticated, signOut, loading, user } = useAuthContext();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Équipements',
      description: 'Gérer votre parc de machines agricoles',
      summary: 'Inventaire complet de vos équipements avec état technique, maintenance planifiée et historique.',
      icon: <Tractor className="h-8 w-8 text-primary" />,
      path: '/equipment',
      requireAuth: true,
      stats: '24 équipements'
    },
    {
      title: 'Pièces',
      description: 'Gérer l\'inventaire des pièces détachées',
      summary: 'Suivi de stock, commandes automatiques et compatibilité avec vos équipements.',
      icon: <Wrench className="h-8 w-8 text-primary" />,
      path: '/parts',
      requireAuth: true,
      stats: '156 références'
    },
    {
      title: 'Maintenance',
      description: 'Planifier et suivre les entretiens',
      summary: 'Calendrier des opérations d\'entretien, alertes et rappels pour optimiser la disponibilité.',
      icon: <Calendar className="h-8 w-8 text-primary" />,
      path: '/maintenance',
      requireAuth: true,
      stats: '8 tâches planifiées'
    },
    {
      title: 'Interventions',
      description: 'Gérer les interventions techniques',
      summary: 'Suivi des réparations, demandes d\'assistance et historique des interventions par équipement.',
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      path: '/interventions',
      requireAuth: true,
      stats: '3 en cours'
    },
    {
      title: 'Tableau de bord',
      description: 'Visualiser les indicateurs clés',
      summary: 'Vue d\'ensemble personnalisable avec indicateurs de performance, alertes et planification.',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      path: '/dashboard',
      requireAuth: true
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre compte et préférences',
      summary: 'Gestion du profil utilisateur, notifications et personnalisation de l\'interface.',
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

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-primary">OptiTractor</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plateforme complète de gestion des équipements, pièces et maintenance agricole
        </p>
      </header>

      {/* Bouton de connexion principal */}
      {!isAuthenticated && (
        <div className="flex justify-center mb-10">
          <Button onClick={handleLogin} size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg">
            <LogIn className="mr-2 h-6 w-6" />
            Se connecter / S'inscrire
          </Button>
        </div>
      )}

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
                <Button onClick={handleLogin} className="ml-auto">
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isAuthenticated && (
        <div className="mb-10 p-6 bg-primary/5 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Bonjour {user?.email}</h2>
              <p className="text-muted-foreground">Bienvenue dans votre espace OptiTractor</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <Card 
            key={item.path} 
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${item.requireAuth && !isAuthenticated ? "opacity-70" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {item.icon}
                </div>
                {item.requireAuth && !isAuthenticated && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    Connexion requise
                  </span>
                )}
                {item.stats && isAuthenticated && (
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    {item.stats}
                  </span>
                )}
              </div>
              <CardTitle className="mt-4 text-2xl">{item.title}</CardTitle>
              <CardDescription className="text-base">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">
                {item.summary}
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
              {item.requireAuth && !isAuthenticated ? (
                <Button 
                  onClick={handleLogin}
                  className="w-full"
                  variant="outline"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter pour accéder
                </Button>
              ) : (
                <Button asChild className="w-full justify-between group">
                  <Link to={item.path}>
                    Accéder
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 p-8 bg-muted rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-4">OptiTractor - Solution complète pour l'agriculture moderne</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
          Optimisez la gestion de votre parc de machines agricoles avec notre solution tout-en-un.
          Suivi de maintenance, inventaire de pièces et gestion des interventions en un seul endroit.
        </p>
        {!isAuthenticated && (
          <Button onClick={handleLogin} size="lg" className="mt-4">
            <LogIn className="mr-2 h-4 w-4" />
            Commencer maintenant
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <AuthDebugger />
        </div>
      )}
    </div>
  );
};

export default Home;
