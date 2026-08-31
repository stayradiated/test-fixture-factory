import { createFactory } from '../create-factory.js'

type Author = { id: number; name: string }
type Book = { id: number; title: string; authorId: number }

const authorFactory = createFactory<Author>('Author')
  .withSchema((f) => ({
    id: f.type<number>().default(() => Math.floor(Math.random() * 1_000_000)),
    name: f.type<string>(),
  }))
  .fixture(async (attrs, use) =>
    use({
      id: attrs.id,
      name: attrs.name,
    }),
  )

const bookFactory = createFactory<Book>('Book')
  .withContext<{ author?: Pick<Author, 'id'> }>()
  .withSchema((f) => ({
    authorId: f.type<number>().maybeFrom('author', ({ author }) => author?.id),
    id: f.type<number>().default(() => Math.floor(Math.random() * 1_000_000)),
    title: f.type<string>().default('Unknown'),
  }))
  .fixture(async (attrs, use) =>
    use({
      id: attrs.id,
      title: attrs.title,
      authorId: attrs.authorId,
    }),
  )

export { authorFactory, bookFactory }
