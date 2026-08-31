import { test as anyTest } from 'vitest'

import { authorFactory, bookFactory } from './author-book.js'

const test = anyTest.extend({
  author: authorFactory.useValue({ name: 'A. Nonymous' }),
  createBook: bookFactory.useCreateValue(),
})

test('useCreateValue uses an existing fixture as context', async ({
  author,
  createBook,
  expect,
}) => {
  const book = await createBook()

  expect(book).toStrictEqual({
    id: expect.any(Number),
    title: 'Unknown',
    authorId: author.id,
  })
})
