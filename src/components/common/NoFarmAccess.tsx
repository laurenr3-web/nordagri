
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideLock, MailPlus, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface PendingInvite {
  id: string;
  farm_id: string;
  role: string;
  created_at: string;
  farm_name?: string;
}

const NoFarmAccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingInvitations();
  }, [user]);

  const fetchPendingInvitations = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const { data: invitations, error } = await supabase
        .from('invitations')
        .select('id, farm_id, role, created_at')
        .eq('email', user.email)
        .eq('status', 'pending');

      if (error) throw error;

      if (invitations && invitations.length > 0) {
        // Fetch farm names
        const farmIds = invitations.map(i => i.farm_id);
        const { data: farms } = await supabase
          .from('farms')
          .select('id, name')
          .in('id', farmIds);

        const invitesWithFarms = invitations.map(inv => ({
          ...inv,
          farm_name: farms?.find(f => f.id === inv.farm_id)?.name || 'Ferme inconnue',
        }));

        setPendingInvites(invitesWithFarms);
      }
    } catch (err) {
      console.error("Erreur chargement invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { invitationId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);

      toast.success("Invitation acceptée ! Bienvenue dans la ferme.");
      // Reload page to refresh auth context
      window.location.reload();
    } catch (err: any) {
      console.error("Erreur acceptation:", err);
      toast.error(err.message || "Erreur lors de l'acceptation de l'invitation");
    } finally {
      setAcceptingId(null);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      viewer: 'Lecteur',
      editor: 'Éditeur',
      admin: 'Administrateur',
      member: 'Membre',
    };
    return labels[role] || role;
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Demande d'accès à une ferme");
    const mailto = `mailto:support@nordagri.com?subject=${subject}`;
    window.open(mailto, '_blank');
  };

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
        
        {loading ? (
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        ) : pendingInvites.length > 0 ? (
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Vous avez des invitations en attente :
            </p>
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium text-sm">{invite.farm_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Rôle : {getRoleLabel(invite.role || 'member')}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAcceptInvitation(invite.id)}
                  disabled={acceptingId === invite.id}
                >
                  {acceptingId === invite.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accepter
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        ) : (
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
                    onClick={handleEmailClick} 
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
                    onClick={() => navigate("/settings")} 
                    className="flex items-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Centre d'aide
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        <CardFooter className="flex justify-center pt-0 pb-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Consulter mon profil
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoFarmAccess;
