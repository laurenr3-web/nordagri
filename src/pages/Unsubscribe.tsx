import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, MailX } from 'lucide-react';

type Status = 'loading' | 'valid' | 'already' | 'invalid' | 'success' | 'error';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid === false && data.reason === 'already_unsubscribed') setStatus('already');
        else if (data.valid) setStatus('valid');
        else setStatus('invalid');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus('success');
      else if (data?.reason === 'already_unsubscribed') setStatus('already');
      else setStatus('error');
    } catch {
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <MailX className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <CardTitle>Désabonnement</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />}
          {status === 'valid' && (
            <>
              <p className="text-muted-foreground">Souhaitez-vous vous désabonner des emails ?</p>
              <Button onClick={handleUnsubscribe} disabled={processing} variant="destructive">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmer le désabonnement
              </Button>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
              <p className="text-muted-foreground">Vous avez été désabonné avec succès.</p>
            </>
          )}
          {status === 'already' && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Vous êtes déjà désabonné.</p>
            </>
          )}
          {status === 'invalid' && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
              <p className="text-muted-foreground">Lien invalide ou expiré.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
              <p className="text-muted-foreground">Une erreur est survenue. Veuillez réessayer.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
