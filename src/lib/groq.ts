import Groq from 'groq-sdk'

export const DEFAULT_MODEL = 'openai/gpt-oss-120b'

/** Proxied to api.groq.com by the Vite dev/preview server (see vite.config.ts). */
const PROXY_PATH = '/api/groq'

/**
 * Requests go to the Vite proxy on this origin, which adds the real key from
 * .env. The apiKey here is a placeholder the SDK insists on; the proxy
 * overwrites the Authorization header, so no real key reaches the browser.
 */
export function getGroqClient(): Groq {
  return new Groq({
    apiKey: 'injected-by-proxy',
    baseURL: `${window.location.origin}${PROXY_PATH}`,
    dangerouslyAllowBrowser: true,
  })
}

/** One single-token completion to check the proxy and key work. Throws on failure. */
export async function testConnection(): Promise<void> {
  await getGroqClient().chat.completions.create(
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
  if (error instanceof Groq.AuthenticationError)
    return 'Groq rejected the key (401). Check GROQ_API_KEY in .env and restart the server.'
  if (error instanceof Groq.RateLimitError) return 'Rate limited by Groq (429). Wait a moment and try again.'
  if (error instanceof Groq.APIConnectionError) return 'Could not reach Groq. Check your connection.'
  if (error instanceof Groq.APIError) return `Groq returned an error${error.status ? ` (${error.status})` : ''}: ${error.message}`
  return error instanceof Error ? error.message : 'Something went wrong.'
}
