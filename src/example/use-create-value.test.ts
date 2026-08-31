import { test as anyTest } from 'vitest'

import type { InferFixtureValue } from '../types.js'

import { authorFactory, bookFactory } from './author-book.js'

const test = anyTest.extend({
  // Vitest requires every referenced fixture to be declared.
  author: undefined,
  createAuthor: authorFactory.useCreateValue({ name: 'Default' }),
  createBook: bookFactory.useCreateValue(),
})

test('useCreateValue creates an author', async ({ createAuthor, expect }) => {
  const author = await createAuthor({ id: 127, name: 'D. Adams' })

  expect(author).toStrictEqual({ id: expect.any(Number), name: 'D. Adams' })
})

test('useCreateValue creates a book', async ({
  createAuthor,
  createBook,
  expect,
}) => {
  const author = await createAuthor({ name: 'D. Adams' })
  const book = await createBook({ authorId: author.id })

  expect(book).toStrictEqual({
    id: expect.any(Number),
    title: 'Unknown',
    authorId: expect.any(Number),
  })
})

test('useCreateValue overrides book defaults', async ({
  createAuthor,
  createBook,
  expect,
}) => {
  const author = await createAuthor({ name: 'D. Adams' })
  const book = await createBook({ title: 'The Book', authorId: author.id })

  expect(book).toStrictEqual({
    id: expect.any(Number),
    title: 'The Book',
    authorId: expect.any(Number),
  })
})

test('InferFixtureValue infers factory callback values', async ({
  createAuthor,
  createBook,
  expect,
}) => {
  const createSummary = async (
    author: InferFixtureValue<
      typeof authorFactory.useCreateValue<{ name: string }>
    >,
    book: InferFixtureValue<typeof bookFactory.useCreateValue>,
  ) => {
    const createdAuthor = await author({ name: 'A. Nonymous' })
    const createdBook = await book({ id: 1, authorId: createdAuthor.id })

    return `[${createdBook.id}] ${createdBook.title} by ${createdAuthor.name}`
  }

  await expect(createSummary(createAuthor, createBook)).resolves.toBe(
    '[1] Unknown by A. Nonymous',
  )
})
