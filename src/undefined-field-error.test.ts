import { test } from 'vitest'

import { UndefinedFieldError } from './undefined-field-error.js'

test('formats attributes missing from the input', ({ expect }) => {
  expect(
    new UndefinedFieldError('User', [{ key: 'name', fixtureList: [] }]).message,
  ).toBe(
    '[User] 1 required field(s) have undefined values:\n- name: must be provided as an attribute',
  )
})

test('formats attributes with contextual sources', ({ expect }) => {
  expect(
    new UndefinedFieldError('Book', [
      { key: 'authorId', fixtureList: ['author', 'request'] },
    ]).message,
  ).toBe(
    '[Book] 1 required field(s) have undefined values:\n- authorId: must be provided as an attribute or via the test context (author, request)',
  )
})
