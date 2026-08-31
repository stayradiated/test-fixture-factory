import { test as anyTest } from 'vitest'

import { authorFactory, bookFactory } from './author-book.js'

const test = anyTest.extend({
  author: authorFactory.useValue({ name: 'A. Nonymous' }),
  book: bookFactory.useValue(),
})

test('useValue provides an author', ({ author, expect }) => {
  expect(author).toStrictEqual({
    id: expect.any(Number),
    name: 'A. Nonymous',
  })
})

test('useValue resolves a book author from the test context', ({
  author,
  book,
  expect,
}) => {
  expect(book).toStrictEqual({
    id: expect.any(Number),
    title: 'Unknown',
    authorId: author.id,
  })
})
