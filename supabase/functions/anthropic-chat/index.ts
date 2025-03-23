
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// API configuration
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

// Validate API key configuration
function validateApiKey(): Error | null {
  if (!ANTHROPIC_API_KEY) {
    return new Error('ANTHROPIC_API_KEY n\'est pas configuré')
  }
  return null
}

// Enhance system prompt with context data
function enhanceSystemPrompt(basePrompt: string, contextData: any): string {
  if (!contextData) {
    return basePrompt || "Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. Répondez toujours en français."
  }

  let enhancedPrompt = basePrompt || "Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. Répondez toujours en français."
  
  enhancedPrompt += "\n\nInformations contextuelles:"
  
  if (contextData.trackingActive !== undefined) {
    enhancedPrompt += `\n- Suivi d'activité: ${contextData.trackingActive ? 'ACTIF' : 'INACTIF'}`
  }
  
  if (contextData.position) {
    enhancedPrompt += `\n- Position actuelle: Latitude ${contextData.position.lat.toFixed(6)}, Longitude ${contextData.position.lng.toFixed(6)}`
  }
  
  if (contextData.fields) {
    enhancedPrompt += `\n- Nombre de champs: ${contextData.fields.length}`
    if (contextData.fields.length > 0) {
      enhancedPrompt += "\n- Champs principaux: " + contextData.fields.slice(0, 3).map(f => f.name).join(", ")
    }
  }
  
  if (contextData.equipment) {
    enhancedPrompt += `\n- Équipements disponibles: ${contextData.equipment.length}`
    if (contextData.equipment.length > 0) {
      enhancedPrompt += "\n- Équipements principaux: " + contextData.equipment.slice(0, 3).map(e => e.name).join(", ")
    }
  }
  
  if (contextData.weather) {
    enhancedPrompt += `\n- Météo actuelle: ${contextData.weather.current}`
    enhancedPrompt += `\n- Prévisions: ${contextData.weather.forecast}`
  }

  enhancedPrompt += `\n- Date actuelle: ${new Date().toLocaleDateString('fr-FR')}`
  enhancedPrompt += `\n- Heure actuelle: ${new Date().toLocaleTimeString('fr-FR')}`
  
  // Instructions for action commands
  enhancedPrompt += "\n\nInstructions pour les actions:"
  enhancedPrompt += "\n- Si l'utilisateur demande de démarrer une activité et que le suivi n'est pas actif, incluez [ACTION:START_TRACKING] dans votre réponse."
  enhancedPrompt += "\n- Si l'utilisateur demande d'arrêter une activité et que le suivi est actif, incluez [ACTION:STOP_TRACKING] dans votre réponse."
  enhancedPrompt += "\n- Si l'utilisateur demande des informations météo, incluez [ACTION:WEATHER_INFO] dans votre réponse."
  enhancedPrompt += "\n- Si l'utilisateur demande des informations sur un champ spécifique, incluez [ACTION:FIELD_INFO:NOM_DU_CHAMP] dans votre réponse."

  return enhancedPrompt
}

// Prepare the payload for Anthropic API
function prepareAnthropicPayload(messages: any[], systemPrompt: string, contextData: any): any {
  return {
    model: contextData?.model || 'claude-3-haiku-20240307',
    max_tokens: contextData?.maxTokens || 1000,
    temperature: contextData?.temperature || 0.7,
    system: systemPrompt,
    messages: messages
  }
}

// Call Anthropic API and return the response
async function callAnthropicApi(payload: any): Promise<any> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
  })

  return await response.json()
}

// Log the request and response data (truncated for brevity)
function logRequestResponse(payload: any, responseData: any): void {
  console.log('Envoi à Anthropic API:', JSON.stringify({
    ...payload,
    system: payload.system.substring(0, 100) + '...' // Truncate for logging
  }))

  console.log('Réponse d\'Anthropic reçue:', JSON.stringify({
    id: responseData.id,
    model: responseData.model,
    type: responseData.type,
    role: responseData.content?.[0]?.type
  }))
}

// Create a success response with the data
function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Create an error response
function createErrorResponse(error: Error): Response {
  console.error('Erreur lors de l\'appel à Anthropic:', error)
  
  return new Response(
    JSON.stringify({ error: error.message }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    }
  )
}

// Main request handler
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req)
  if (corsResponse) return corsResponse

  // Validate API key
  const apiKeyError = validateApiKey()
  if (apiKeyError) {
    return createErrorResponse(apiKeyError)
  }

  try {
    // Extract request data
    const { messages, systemPrompt, contextData } = await req.json()

    // Enhance system prompt with context
    const enhancedSystemPrompt = enhanceSystemPrompt(systemPrompt, contextData)

    // Prepare API payload
    const payload = prepareAnthropicPayload(messages, enhancedSystemPrompt, contextData)

    // Call Anthropic API
    const responseData = await callAnthropicApi(payload)

    // Log request and response
    logRequestResponse(payload, responseData)

    // Return success response
    return createSuccessResponse(responseData)
  } catch (error) {
    // Handle errors
    return createErrorResponse(error)
  }
}

// Start server with the request handler
serve(handleRequest)
