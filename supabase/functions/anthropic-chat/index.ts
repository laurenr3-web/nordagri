
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

    // Récupérer les messages et contexte de la requête
    const { messages, systemPrompt, contextData } = await req.json()

    // Enrichir le prompt système avec les données contextuelles
    let enhancedSystemPrompt = systemPrompt || "Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. Répondez toujours en français."
    
    // Ajouter des données contextuelles si elles sont fournies
    if (contextData) {
      enhancedSystemPrompt += "\n\nInformations contextuelles:"
      
      if (contextData.trackingActive !== undefined) {
        enhancedSystemPrompt += `\n- Suivi d'activité: ${contextData.trackingActive ? 'ACTIF' : 'INACTIF'}`
      }
      
      if (contextData.position) {
        enhancedSystemPrompt += `\n- Position actuelle: Latitude ${contextData.position.lat.toFixed(6)}, Longitude ${contextData.position.lng.toFixed(6)}`
      }
      
      if (contextData.fields) {
        enhancedSystemPrompt += `\n- Nombre de champs: ${contextData.fields.length}`
        if (contextData.fields.length > 0) {
          enhancedSystemPrompt += "\n- Champs principaux: " + contextData.fields.slice(0, 3).map(f => f.name).join(", ")
        }
      }
      
      if (contextData.equipment) {
        enhancedSystemPrompt += `\n- Équipements disponibles: ${contextData.equipment.length}`
        if (contextData.equipment.length > 0) {
          enhancedSystemPrompt += "\n- Équipements principaux: " + contextData.equipment.slice(0, 3).map(e => e.name).join(", ")
        }
      }
      
      if (contextData.weather) {
        enhancedSystemPrompt += `\n- Météo actuelle: ${contextData.weather.current}`
        enhancedSystemPrompt += `\n- Prévisions: ${contextData.weather.forecast}`
      }

      enhancedSystemPrompt += `\n- Date actuelle: ${new Date().toLocaleDateString('fr-FR')}`
      enhancedSystemPrompt += `\n- Heure actuelle: ${new Date().toLocaleTimeString('fr-FR')}`
      
      // Instructions pour les actions à effectuer
      enhancedSystemPrompt += "\n\nInstructions pour les actions:"
      enhancedSystemPrompt += "\n- Si l'utilisateur demande de démarrer une activité et que le suivi n'est pas actif, incluez [ACTION:START_TRACKING] dans votre réponse."
      enhancedSystemPrompt += "\n- Si l'utilisateur demande d'arrêter une activité et que le suivi est actif, incluez [ACTION:STOP_TRACKING] dans votre réponse."
      enhancedSystemPrompt += "\n- Si l'utilisateur demande des informations météo, incluez [ACTION:WEATHER_INFO] dans votre réponse."
      enhancedSystemPrompt += "\n- Si l'utilisateur demande des informations sur un champ spécifique, incluez [ACTION:FIELD_INFO:NOM_DU_CHAMP] dans votre réponse."
    }

    // Préparer les paramètres pour l'API Anthropic
    const payload = {
      model: contextData?.model || 'claude-3-haiku-20240307',
      max_tokens: contextData?.maxTokens || 1000,
      temperature: contextData?.temperature || 0.7,
      system: enhancedSystemPrompt,
      messages: messages
    }

    console.log('Envoi à Anthropic API:', JSON.stringify({
      ...payload,
      system: payload.system.substring(0, 100) + '...' // Tronquer pour la journalisation
    }))

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
    console.log('Réponse d\'Anthropic reçue:', JSON.stringify({
      id: data.id,
      model: data.model,
      type: data.type,
      role: data.content?.[0]?.type
    }))

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
