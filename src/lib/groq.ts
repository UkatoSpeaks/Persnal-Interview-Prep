import Groq from 'groq-sdk'
import { getApiKey } from './storage'

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Groq API key set. Add one in Settings.')
    this.name = 'MissingApiKeyError'
  }
}

/**
 * Built per call so a key changed in Settings takes effect immediately.
 * Pass `apiKey` only to try a key that isn't saved yet.
 */
export function getGroqClient(apiKey: string = getApiKey()): Groq {
  if (!apiKey) throw new MissingApiKeyError()
  return new Groq({ apiKey, dangerouslyAllowBrowser: true })
}

/** One single-token completion to check the key works. Throws on failure. */
export async function testConnection(apiKey?: string): Promise<void> {
  await getGroqClient(apiKey).chat.completions.create(
    {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'ping' }],
      max_completion_tokens: 1,
    },
    { maxRetries: 0 },
  )
}

/** A short, user-facing message for anything thrown by a Groq call. */
export function describeGroqError(error: unknown): string {
  if (error instanceof Groq.AuthenticationError) return 'Groq rejected this key (401). Check it and try again.'
  if (error instanceof Groq.RateLimitError) return 'Rate limited by Groq (429). Wait a moment and try again.'
  if (error instanceof Groq.APIConnectionError) return 'Could not reach Groq. Check your connection.'
  if (error instanceof Groq.APIError) return `Groq returned an error${error.status ? ` (${error.status})` : ''}: ${error.message}`
  return error instanceof Error ? error.message : 'Something went wrong.'
}
