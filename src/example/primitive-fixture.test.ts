import { test as anyTest } from 'vitest'

import { createFactory } from '../create-factory.js'

const nonceFactory = createFactory<string>('Nonce').fixture(async (_, use) => {
  await use('nonce')
})

const test = anyTest.extend({ nonce: nonceFactory.useValue() })

test('fixtures can be schema-less primitive values', ({ expect, nonce }) => {
  expect(nonce).toBe('nonce')
})
