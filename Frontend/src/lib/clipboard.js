export async function readClipboardText() {
  if (!navigator.clipboard?.readText) {
    throw new Error('Clipboard reading requires a secure context.')
  }
  return navigator.clipboard.readText()
}

export async function copyText(text, input) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable.')
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    if (!input || typeof document.execCommand !== 'function') return false

    input.focus()
    input.select()
    input.setSelectionRange(0, input.value.length)
    try {
      return document.execCommand('copy')
    } catch {
      return false
    }
  }
}
