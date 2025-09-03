import { test as anyTest, describe } from 'vitest'

import type { InferFixtureValue } from './types.js'

import { createFactory } from './create-factory.js'

type Author = { id: number; name: string }

const authorFactory = createFactory('Author')
  .withSchema((f) => ({
    id: f.type<number>().default(() => Math.floor(Math.random() * 1_000_000)),
    name: f.type<string>(),
  }))
  .withValue(async (attrs) => {
    const { id, name } = attrs

    const value: Author = {
      id,
      name,
    }

    return { value }
  })

const { useCreateValue: useCreateAuthor, useValue: useAuthor } = authorFactory

type Book = { id: number; title: string; authorId: number }

const bookFactory = createFactory('Book')
  .withContext<{ author?: Pick<Author, 'id'> }>()
  .withSchema((f) => ({
    authorId: f.type<number>().maybeFrom('author', ({ author }) => author?.id),
    id: f.type<number>().default(() => Math.floor(Math.random() * 1_000_000)),
    title: f.type<string>().default('Unknown'),
  }))
  .withValue(async (attrs) => {
    const { id, authorId, title } = attrs

    const value: Book = {
      id,
      title: title,
      authorId,
    }

    return { value }
  })

const { useCreateValue: useCreateBook, useValue: useBook } = bookFactory

describe('useValue', () => {
  const test = anyTest.extend({
    author: useAuthor({ name: 'A. Nonymous' }),
    book: useBook(),
  })

  test('should use an author', async ({ author, expect }) => {
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'A. Nonymous',
    })
  })

  test('should use a book', async ({ author, book, expect }) => {
    expect(book).toStrictEqual({
      id: expect.any(Number),
      title: 'Unknown',
      authorId: author.id,
    })
  })
})

describe('useValue with attributes', () => {
  const test = anyTest.extend({
    author: useAuthor({ name: 'Maxine' }),
    book: useBook({ title: 'The Book' }),
  })

  test('should use an author with a certain name', async ({
    author,
    expect,
  }) => {
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'Maxine',
    })
  })

  test('should use a book with a certain title', async ({
    author,
    book,
    expect,
  }) => {
    expect(book).toStrictEqual({
      id: expect.any(Number),
      title: 'The Book',
      authorId: author.id,
    })
  })
})

describe('useCreate', () => {
  const test = anyTest.extend({
    createAuthor: useCreateAuthor({ name: 'Default' }),
    createBook: useCreateBook(),
  })

  test('should create an author', async ({ createAuthor, expect }) => {
    const author = await createAuthor({ id: 127, name: 'D. Adams' })
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'D. Adams',
    })
  })

  test('should create a book', async ({ createAuthor, createBook, expect }) => {
    const author = await createAuthor({ name: 'D. Adams' })
    const book = await createBook({ authorId: author.id })

    expect(book).toStrictEqual({
      id: expect.any(Number),
      title: 'Unknown',
      authorId: expect.any(Number),
    })
  })

  test('should create a book with a certain title', async ({
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

  describe('InferFixtureValue', () => {
    const createSummary = async (
      createAuthor: InferFixtureValue<typeof useCreateAuthor<{ name: string }>>,
      createBook: InferFixtureValue<typeof useCreateBook>,
    ) => {
      const author = await createAuthor({ name: 'A. Nonymous' })
      const book = await createBook({ id: 1, authorId: author.id })

      return `[${book.id}] ${book.title} by ${author.name}`
    }

    test('should infer fixture value from factory fn', async ({
      createAuthor,
      createBook,
      expect,
    }) => {
      const summary = await createSummary(createAuthor, createBook)
      expect(summary).toBe('[1] Unknown by A. Nonymous')
    })
  })
})

describe('useValue + useCreate', () => {
  const test = anyTest.extend({
    author: useAuthor({ name: 'A. Nonymous' }),
    createBook: useCreateBook(),
  })

  test('should create a book with an existing author', async ({
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
})

describe('With missing attributes', () => {
  const test = anyTest.extend({
    createBook: useCreateBook(),
    createAuthor: useCreateAuthor(),

    // NOTE: we do not specify the `author/authorId` attribute here
    // so using book _will_ fail
    book: useBook(),
  })

  test.fails(
    'should fail when resolving authorId',
    async ({ book, expect }) => {
      // NOTE: this test is  never actually run
      expect(book).toBeUndefined()
    },
  )

  test('should fail when resolving createBook().authorId', async ({
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

  test('should fail when resolving createAuthor().name', async ({
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
})
