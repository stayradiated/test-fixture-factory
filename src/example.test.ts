import { test as anyTest, describe } from 'vitest'

import { defineFactory } from './define-factory.js'
import { f } from './field-builder.js'

type Author = { id: number; name: string }

const authorFactory = defineFactory(
  'Author',
  {
    id: f.type<number>().default(Math.floor(Math.random() * 1_000_000)),
    name: f.type<string>(),
  },
  async (attrs) => {
    const { id, name } = attrs

    const value: Author = {
      id,
      name,
    }

    return { value }
  },
)

const { useCreateFn: useCreateAuthor, useValueFn: useAuthor } = authorFactory

type Book = { id: number; title: string; authorId: number }

const bookFactory = defineFactory(
  'Book',
  {
    authorId: f
      .type<number>()
      .useContext(({ author }: { author?: Pick<Author, 'id'> }) => author?.id),
    id: f.type<number>().default(Math.floor(Math.random() * 1_000_000)),
    title: f.type<string>().default('Unknown'),
  },
  async (attrs) => {
    const { id, authorId, title } = attrs

    const value: Book = {
      id,
      title: title,
      authorId,
    }
    return { value }
  },
)
const { useCreateFn: useCreateBook, useValueFn: useBook } = bookFactory

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
    createAuthor: useCreateAuthor({ name: 'D. Adams' }),
    createBook: useCreateBook(),
  })

  test('should create an author', async ({ createAuthor, expect }) => {
    const author = await createAuthor({ id: 127 })
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'D. Adams',
    })
  })

  test('should create a book', async ({ createAuthor, createBook, expect }) => {
    const author = await createAuthor({})

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
    const author = await createAuthor({})

    const book = await createBook({ title: 'The Book', authorId: author.id })
    expect(book).toStrictEqual({
      id: expect.any(Number),
      title: 'The Book',
      authorId: expect.any(Number),
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
