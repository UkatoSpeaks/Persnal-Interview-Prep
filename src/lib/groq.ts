import Groq from 'groq-sdk'
import { getApiKey } from './storage'

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Groq API key set. Add one in Settings.')
    this.name = 'MissingApiKeyError'
  }
}

/** Built per call so a key changed in Settings takes effect immediately. */
export function getGroqClient(): Groq {
  const apiKey = getApiKey()
  if (!apiKey) throw new MissingApiKeyError()
  return new Groq({ apiKey, dangerouslyAllowBrowser: true })
}
