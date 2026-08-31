import { test as anyTest } from 'vitest'

import { authorFactory, bookFactory } from './author-book.js'

const test = anyTest.extend({
  author: authorFactory.useValue({ name: 'Maxine' }),
  book: bookFactory.useValue({ title: 'The Book' }),
})

test('useValue applies author attributes', ({ author, expect }) => {
  expect(author).toStrictEqual({ id: expect.any(Number), name: 'Maxine' })
})

test('useValue applies book attributes', ({ author, book, expect }) => {
  expect(book).toStrictEqual({
    id: expect.any(Number),
    title: 'The Book',
    authorId: author.id,
  })
})
