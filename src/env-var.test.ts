import { afterEach, test, vi } from 'vitest'

const originalSkipDestroy = process.env.TFF_SKIP_DESTROY

afterEach(() => {
  if (originalSkipDestroy === undefined) {
    delete process.env.TFF_SKIP_DESTROY
  } else {
    process.env.TFF_SKIP_DESTROY = originalSkipDestroy
  }
})

const loadSkipDestroy = async (value: string | undefined) => {
  if (value === undefined) {
    delete process.env.TFF_SKIP_DESTROY
  } else {
    process.env.TFF_SKIP_DESTROY = value
  }

  vi.resetModules()
  return (await import('./env-var.js')).SKIP_DESTROY
}

test('SKIP_DESTROY is false when TFF_SKIP_DESTROY is absent', async ({
  expect,
}) => {
  await expect(loadSkipDestroy(undefined)).resolves.toBe(false)
})

test('SKIP_DESTROY parses TFF_SKIP_DESTROY as a boolean', async ({
  expect,
}) => {
  await expect(loadSkipDestroy('yes')).resolves.toBe(true)
  await expect(loadSkipDestroy('0')).resolves.toBe(false)
})
