import { expect, it, vi } from 'vitest'
import { copyText } from './clipboard'

it('falls back to selecting the field and execCommand on an HTTP page', async () => {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand')
  const input = document.createElement('input')
  input.value = 'http://192.168.162.130:32333/ABC12345'
  document.body.append(input)

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  })
  const execCommand = vi.fn(() => true)
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  })

  expect(await copyText(input.value, input)).toBe(true)
  expect(execCommand).toHaveBeenCalledWith('copy')
  expect(input.selectionStart).toBe(0)
  expect(input.selectionEnd).toBe(input.value.length)

  input.remove()
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else delete navigator.clipboard
  if (execCommandDescriptor) Object.defineProperty(document, 'execCommand', execCommandDescriptor)
  else delete document.execCommand
})
