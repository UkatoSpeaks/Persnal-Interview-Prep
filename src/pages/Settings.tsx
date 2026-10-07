import { useState, type FormEvent } from 'react'
import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { describeGroqError, testConnection } from '../lib/groq'
import { clearApiKey, getApiKey, setApiKey } from '../lib/storage'

interface Status {
  ok: boolean
  text: string
}

export default function Settings() {
  const [savedKey, setSavedKey] = useState(getApiKey)
  const [value, setValue] = useState(savedKey)
  const [visible, setVisible] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const key = value.trim()

  function handleSave(event: FormEvent) {
    event.preventDefault()
    setApiKey(key)
    // Read it back, so a failed write shows up instead of a false "Saved".
    const stored = getApiKey()
    setSavedKey(stored)
    setStatus(
      stored === key
        ? { ok: true, text: 'Saved.' }
        : { ok: false, text: 'Could not save. This browser is blocking localStorage.' },
    )
  }

  function handleClear() {
    clearApiKey()
    setSavedKey('')
    setValue('')
    setStatus(null)
  }

  async function handleTest() {
    setTesting(true)
    setStatus(null)
    try {
      await testConnection(key)
      setStatus({ ok: true, text: 'Connected. Groq accepted this key.' })
    } catch (error) {
      setStatus({ ok: false, text: describeGroqError(error) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <section className="max-w-reading">
      <h1 className="text-xl">Settings</h1>
      <p className="mt-1 text-sm text-muted">Groq API key and app preferences.</p>

      <Card className="mt-8">
        <h2 className="text-base">Groq API key</h2>
        <p className="mt-1 text-sm text-muted">
          Needed for the AI features. Create a free key at{' '}
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

        <form onSubmit={handleSave} className="mt-6">
          <label htmlFor="groq-api-key" className="mb-2 block text-sm font-medium">
            API key
          </label>
          <div className="relative">
            <Input
              id="groq-api-key"
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setStatus(null)
              }}
              disabled={testing}
              placeholder="gsk_..."
              autoComplete="off"
              spellCheck={false}
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? 'Hide key' : 'Show key'}
              aria-pressed={visible}
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-control text-muted transition-colors hover:text-ink"
            >
              {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Your key is stored only in this browser.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!key || key === savedKey || testing}>
              Save
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={!key || testing}>
              {testing ? 'Testing...' : 'Test connection'}
            </Button>
            <Button variant="ghost" onClick={handleClear} disabled={(!savedKey && !value) || testing}>
              Clear
            </Button>
          </div>

          <div aria-live="polite">
            {status && (
              <p
                className={`mt-4 flex items-start gap-2 text-sm ${
                  status.ok ? 'text-confident-ink' : 'text-weak-ink'
                }`}
              >
                {status.ok ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                ) : (
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                )}
                <span className="min-w-0 wrap-break-word">{status.text}</span>
              </p>
            )}
          </div>
        </form>
      </Card>
    </section>
  )
}
