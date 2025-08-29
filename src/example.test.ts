import { test as anyTest, describe } from 'vitest'
import { defineFactory } from './define-factory.js'
import { UndefinedFieldError } from './undefined-field-error.js'

type AuthorDeps = Record<string, unknown>
type Author = { id: number; name: string }
// biome-ignore lint/suspicious/noConfusingVoidType: void is used to indicate optional attributes
type AuthorAttrs = void | Partial<Author>

const authorFactory = defineFactory<AuthorDeps, AuthorAttrs, Author>(
  // biome-ignore lint/correctness/noEmptyPattern: vitest requires {}
  async ({}, attrs) => {
    const value: Author = {
      id: Math.floor(Math.random() * 1_000_000),
      name: attrs?.name ?? 'Unknown',
    }

    return { value }
  },
)
const { useCreateFn: useCreateAuthor, useValueFn: useAuthor } = authorFactory

type BookDeps = { author?: Pick<Author, 'id'> }
type Book = { id: number; title: string; authorId: number }
// biome-ignore lint/suspicious/noConfusingVoidType: void is used to indicate optional attributes
type BookAttrs = void | Partial<Book>

const bookFactory = defineFactory<BookDeps, BookAttrs, Book>(
  async ({ author }, attrs) => {
    const authorId = author?.id ?? attrs?.authorId
    if (typeof authorId !== 'number') {
      throw new UndefinedFieldError({
        factory: 'bookFactory',
        attribute: 'authorId',
        dependency: 'author',
      })
    }

    const value: Book = {
      id: Math.floor(Math.random() * 1_000_000),
      title: attrs?.title ?? 'Unknown',
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
    createAuthor: useCreateAuthor(),
    createBook: useCreateBook(),
  })

  test('should create an author', async ({ createAuthor, expect }) => {
    const author = await createAuthor()
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'Unknown',
    })
  })

  test('should create an author with a certain name', async ({
    createAuthor,
    expect,
  }) => {
    const author = await createAuthor({ name: 'Maxine' })
    expect(author).toStrictEqual({
      id: expect.any(Number),
      name: 'Maxine',
    })
  })

  test('should create a book', async ({ createAuthor, createBook, expect }) => {
    const author = await createAuthor()

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
    const author = await createAuthor()

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
    author: useAuthor(),
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
