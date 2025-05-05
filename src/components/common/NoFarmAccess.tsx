
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideLock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <CardContent>
          <p className="text-center text-muted-foreground">
            Pour accéder à l'application, vous devez être invité à rejoindre une ferme. 
            Veuillez contacter l'administrateur d'une ferme pour obtenir une invitation.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Consulter mon profil
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoFarmAccess;
