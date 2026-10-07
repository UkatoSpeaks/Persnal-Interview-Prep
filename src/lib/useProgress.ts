import { useSyncExternalStore } from 'react'
import type { Progress } from '../types'
import { getProgress, subscribeProgress } from './storage'

/**
 * Subscribes a component to one slice of the saved progress; it re-renders
 * only when that slice changes. The selector must return a primitive or a
 * value taken straight from the progress object (not a new array or object),
 * otherwise it would look changed on every render.
 */
export function useProgress<T>(selector: (progress: Progress) => T): T {
  return useSyncExternalStore(subscribeProgress, () => selector(getProgress()))
}
