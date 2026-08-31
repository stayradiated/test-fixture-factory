import { test as anyTest } from 'vitest'

import { authorFactory, bookFactory } from './author-book.js'

const test = anyTest.extend({
  author: undefined,
  createBook: bookFactory.useCreateValue(),
  createAuthor: authorFactory.useCreateValue(),
  book: bookFactory.useValue(),
})

test.fails('useValue fails when a contextual attribute is missing', async ({
  book,
  expect,
}) => {
  expect(book).toBeUndefined()
})

test('useCreateValue reports a missing contextual attribute', async ({
  createBook,
  expect,
}) => {
  await expect(() =>
    createBook({ title: 'The Book' }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: [Book] 1 required field(s) have undefined values:
      - authorId: must be provided as an attribute or via the test context (author)]
    `)
})

test('useCreateValue reports a missing required attribute', async ({
  createAuthor,
  expect,
}) => {
  await expect(() =>
    createAuthor({ name: undefined as unknown as string }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: [Author] 1 required field(s) have undefined values:
    - name: must be provided as an attribute]
  `)
})
