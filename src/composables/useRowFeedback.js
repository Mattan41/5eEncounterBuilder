import { ref } from 'vue'

/**
 * Tracks which rows/buttons were just acted on so the view can highlight them
 * with a CSS class instead of mutating inline styles from JavaScript.
 */
export function useRowFeedback(duration = 1000) {
  const flashingIds = ref(new Set())

  const flash = (id) => {
    const next = new Set(flashingIds.value)
    next.add(id)
    flashingIds.value = next

    setTimeout(() => {
      const current = new Set(flashingIds.value)
      current.delete(id)
      flashingIds.value = current
    }, duration)
  }

  const isFlashing = (id) => flashingIds.value.has(id)

  return { flash, isFlashing }
}
