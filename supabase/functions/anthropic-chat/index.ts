
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// This edge function will use an environment variable set in the Supabase dashboard 
// and not hardcoded in the code for security reasons
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Vérifier que la clé API est configurée
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY n\'est pas configuré' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Récupérer les messages de la requête
    const { messages, systemPrompt } = await req.json()

    // Préparer les paramètres pour l'API Anthropic
    const payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt || "Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. Répondez toujours en français.",
      messages: messages
    }

    console.log('Envoi à Anthropic API:', JSON.stringify(payload))

    // Appeler l'API Anthropic
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    })

    // Récupérer et retourner la réponse
    const data = await response.json()
    console.log('Réponse d\'Anthropic reçue:', JSON.stringify(data))

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur lors de l\'appel à Anthropic:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
