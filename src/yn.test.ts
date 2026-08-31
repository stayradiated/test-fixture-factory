import { expect, test } from 'vitest'

import { yn } from './yn.js'

test.each(['y', 'yes', 'true', '1', 'on', ' YES '])(
  'yn returns true for %j',
  (value) => {
    expect(yn(value)).toBe(true)
  },
)

test.each(['n', 'no', 'false', '0', 'off', '', 'unknown', null, undefined])(
  'yn returns false for %j',
  (value) => {
    expect(yn(value)).toBe(false)
  },
)
