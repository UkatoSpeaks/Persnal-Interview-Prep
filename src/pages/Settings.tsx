import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { describeGroqError, testConnection } from '../lib/groq'

type Status = { state: 'checking' } | { state: 'ok' } | { state: 'error'; message: string }

export default function Settings() {
  const [status, setStatus] = useState<Status>({ state: 'checking' })

  // The key never reaches the browser, so the only way to know it works is to
  // send one tiny request through the proxy.
  const check = useCallback(async () => {
    setStatus({ state: 'checking' })
    try {
      await testConnection()
      setStatus({ state: 'ok' })
    } catch (error) {
      setStatus({ state: 'error', message: describeGroqError(error) })
    }
  }, [])

  useEffect(() => {
    void check()
  }, [check])

  return (
    <section className="max-w-reading">
      <h1 className="text-xl">Settings</h1>
      <p className="mt-1 text-sm text-muted">Groq API key and app preferences.</p>

      <Card className="mt-8">
        <h2 className="text-base">Groq API key</h2>
        <p className="mt-1 text-sm text-muted">
          Needed for the AI features. Set <code className="font-mono text-xs">GROQ_API_KEY</code> in{' '}
          <code className="font-mono text-xs">.env</code> and restart the server. The key stays on
          the local server and is never sent to this page. Create a free key at{' '}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            console.groq.com/keys
          </a>
          .
        </p>

        <div className="mt-6" aria-live="polite">
          {status.state === 'checking' && <p className="text-sm text-muted">Checking connection...</p>}
          {status.state === 'ok' && (
            <p className="flex items-start gap-2 text-sm text-confident-ink">
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              API key: working. Groq accepted a test request through the proxy.
            </p>
          )}
          {status.state === 'error' && (
            <p className="flex items-start gap-2 text-sm text-weak-ink">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="min-w-0 wrap-break-word">{status.message}</span>
            </p>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={check} disabled={status.state === 'checking'}>
            Test connection
          </Button>
        </div>
      </Card>
    </section>
  )
}
