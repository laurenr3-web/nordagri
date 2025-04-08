
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, Shield, Key, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const Profile = () => {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil utilisateur</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
        <Card>
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-agri-primary text-white text-xl">U</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">Utilisateur</CardTitle>
            <CardDescription>Technicien agricole</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Inscrit depuis Janvier 2024</p>
            <p className="text-sm text-muted-foreground">Dernière connexion: aujourd'hui</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" size="sm">Changer la photo</Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2 flex-1">
              <User className="h-4 w-4" />
              <span>Personnel</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 flex-1">
              <Shield className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 flex-1">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Prénom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Nom" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <Input id="email" type="email" placeholder="exemple@agri-erp.fr" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="phone">Téléphone</Label>
                    </div>
                    <Input id="phone" placeholder="+33 6 12 34 56 78" />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Gérez les paramètres de sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Mot de passe</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Authentification à deux facteurs</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Mettre à jour le mot de passe</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Notifications de maintenance</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des alertes pour les maintenances planifiées
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Alertes d'équipement</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des alertes lorsque des équipements nécessitent attention
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Alertes de stock</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des alertes lorsque le stock de pièces est bas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Notifications par email</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez également les notifications par email
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enregistrer les préférences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
