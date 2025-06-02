
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Secure Perplexity client that uses Supabase secrets
export class SecurePerplexityClient {
  private apiKey: string | null = null;
  private client: any = null;

  private async getApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    try {
      // In a real implementation, this would call a Supabase Edge Function
      // that has access to the secret PERPLEXITY_API_KEY
      const { data, error } = await supabase.functions.invoke('get-perplexity-key');
      
      if (error) {
        throw new Error('Failed to retrieve API key from secure storage');
      }

      this.apiKey = data.apiKey;
      return this.apiKey;
    } catch (error) {
      console.error('Error retrieving Perplexity API key:', error);
      toast.error('Configuration error', {
        description: 'Unable to access AI services. Please contact administrator.'
      });
      throw error;
    }
  }

  private async getClient() {
    if (this.client) {
      return this.client;
    }

    const apiKey = await this.getApiKey();
    
    this.client = axios.create({
      baseURL: 'https://api.perplexity.ai',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Enhanced error handling
    this.client.interceptors.response.use(
      (response: any) => {
        console.log(`✅ Secure Perplexity API (${response.config.url}): Status ${response.status}`);
        return response;
      },
      (error: any) => {
        console.error('❌ Secure Perplexity API Error:', error.response?.status || 'Network Error');
        
        if (error.response?.status === 401) {
          // API key is invalid, clear it to force refresh
          this.apiKey = null;
          this.client = null;
          toast.error('API Authentication Failed', {
            description: 'Please contact administrator to update API configuration'
          });
        } else if (error.response?.status === 429) {
          toast.error('Service Temporarily Unavailable', {
            description: 'AI service rate limit reached. Please try again later.'
          });
        } else {
          toast.error('AI Service Error', {
            description: 'Unable to process request. Please try again.'
          });
        }
        
        return Promise.reject(error);
      }
    );

    return this.client;
  }

  async query(prompt: string, options: any = {}): Promise<string | null> {
    try {
      // Input validation and sanitization
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt provided');
      }

      if (prompt.length > 4000) {
        throw new Error('Prompt too long');
      }

      const client = await this.getClient();
      
      const response = await client.post('/chat/completions', {
        model: options.model || "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful assistant for agricultural equipment management."
          },
          {
            role: "user",
            content: prompt.trim()
          }
        ],
        temperature: Math.min(Math.max(options.temperature || 0.2, 0), 1),
        max_tokens: Math.min(options.maxTokens || 500, 1000),
        ...options.additionalParams
      });

      return response.data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('❌ Secure Perplexity Query Error:', error);
      return null;
    }
  }

  // Clear cached credentials (useful for logout)
  clearCredentials() {
    this.apiKey = null;
    this.client = null;
  }
}

// Export singleton instance
export const securePerplexityClient = new SecurePerplexityClient();
