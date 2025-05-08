
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideLock, MailPlus, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NoFarmAccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <LucideLock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Accès limité</CardTitle>
          <CardDescription>
            Vous n'avez pas encore accès à une ferme
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite">Être invité</TabsTrigger>
            <TabsTrigger value="help">Aide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invite" className="p-4">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Pour accéder à l'application, vous devez être invité à rejoindre une ferme existante.
              </p>
              
              <div className="flex flex-col items-center space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "mailto:support@nordagri.com?subject=Demande%20d'accès%20à%20une%20ferme"} 
                  className="flex items-center"
                >
                  <MailPlus className="h-4 w-4 mr-2" />
                  Demander un accès
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Si vous êtes membre d'une ferme mais que vous ne pouvez pas y accéder :
              </p>
              
              <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                <li>Vérifiez que vous utilisez bien le compte avec lequel vous avez été invité</li>
                <li>Contactez l'administrateur de votre ferme pour vérifier votre invitation</li>
                <li>Vérifiez dans votre boîte mail si vous avez reçu une invitation à rejoindre</li>
              </ul>
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/profile")} 
                  className="flex items-center"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Centre d'aide
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-center pt-0 pb-4">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Consulter mon profil
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoFarmAccess;
