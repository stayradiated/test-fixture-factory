# test-fixture-factory

`test-fixture-factory` helps you create **typed, ergonomic test fixtures** for **Vitest** using a fluent factory API. Define attributes and defaults once, declare what can be read from the test context, and get clean fixtures with automatic teardown.

* ✅ **First-class TypeScript**: schema-driven, end-to-end inference
* ✅ **Explicit context reads**: `.from()` / `.maybeFrom()` link fields to fixtures on the test context
* ✅ **Lifecycle control**: auto-destroy by default, opt-out via env or per-fixture
* ✅ **Great DX**: actionable errors (with factory names and missing fields)

> Works best with [Vitest Test Contexts](https://vitest.dev/guide/test-context.html). It can also be used outside Vitest via `factory.build(...)` for ad-hoc creation.

## 📚 Documentation

- **[Migration Guide](./MIGRATION.md)** - Upgrading from v1? Step-by-step migration instructions
- **[Changelog](./CHANGELOG.md)** - Complete version history and breaking changes

---

## Installation

```bash
npm i -D test-fixture-factory
```

**Requirements**

* Node.js 24+
* TypeScript 5+
* Vitest (or Playwright + fixture layer)

---

## Quickstart

```typescript
import { createFactory } from 'test-fixture-factory'

// 1) Define a factory with a schema
const companyFactory = createFactory('Company')
  .withSchema((f) => ({
    name: f.type<string>(),
  }))
  .fixture(async (attrs, use) => {
    const { name } = attrs
    const company = await prisma.company.create({ data: { name } })
    await use(company)
    await prisma.company.delete({ where: { id: company.id } })
  })

// 2) Use it in Vitest via fixtures
export const { useValue: useCompany, useCreateValue: useCreateCompany } = companyFactory
```

```typescript
// example.test.ts
import { test as anyTest, expect } from 'vitest'
import { useCompany } from './factories/company.js'

const test = anyTest.extend({
  company: useCompany({ name: 'Acme' }),
})

test('creates data tied to a company', async ({ company }) => {
  expect(company).toEqual({ id: expect.any(Number), name: 'Acme' })
})
```

---

## Core Concepts

### Factory

Built via `createFactory(name)` + `.withSchema()` + `.fixture()`

### Schema Fields

Declared with `f.type<T>()` and refined with:

* `.optional()` — mark the field optional
* `.default(value | () => value)` — supply a default; makes field optional for **input**
* `.from('fixture' | ['a','b'], (ctx) => T)` — read **required** value(s) from test context (see overloads below)
* `.maybeFrom('fixture' | ['a','b'], (ctx) => T | undefined)` — read **optional** value(s) from context

### Fixtures

Vitest fixtures returned by `.useValue(...)` or `.useCreateValue(...)`

### Teardown

Fixtures will be automatically cleaned up after each test runs. Just as in Vitest
fixtures, the call `await use()`, you can then add any teardown code you need 

```typescript
.fixture(async (attrs, use) => {
    const value = await createValue()

    // this will block until the test has finished
    await use(value)

    // teardown goes here
    await deleteValue(value)
})
```

---

## How Values Are Resolved

Given a schema, the attributes passed to `.fixture()` are resolved in this order (later wins):

1. **Defaults** from `.default(...)`
2. **Context values** from `.from(...)` / `.maybeFrom(...)`
3. **Preset attributes** from `.useValue(preset)` or `.useCreateValue(preset)`
4. **Call-time attributes** passed to the `create()` function (only with `.useCreateValue()`)

Undefined keys are removed; later sources win.

> If a field is **required** and resolves to `undefined`, you'll get an `UndefinedFieldError` telling you which field was missing and which fixture(s) could have provided it.

---

## API Reference

### Factory Builder

#### `createFactory(name: string)` → `FactoryBuilder`

Creates a new factory builder. The `name` appears in error messages.

#### `.withContext<Context>()`

Declare the shape of the test context (fixtures) that fields can read from.

```typescript
const userFactory = createFactory('User')
  .withContext<{ company: Company }>()
```

#### `.withSchema(schemaFn)`

Define fields using a builder `f`.

```typescript
.withSchema((f) => ({
  companyId: f
    .type<number>()
    .from('company', ({ company }) => company.id),
  name: f.type<string>(),
  email: f.type<string>().default('default@email.com'),
}))
```

**Field builder methods & overloads**

```typescript
// Required field
f.type<string>()

// Optional field
f.type<string>().optional()

// Field with default value
f.type<string>().default('hello world')

// Field with calculated default value
f.type<number>().default(() => Math.random())

// Read from context (with transform):
// .withContext<{ user: { name: string } }>
f.type<string>().from('user', (ctx) => ctx.user.name)

// Shorthand when the type already matches:
// .withContext<{ name: string }>
f.type<string>().from('name')

// Optional read from context (may return undefined):
// .withContext<{ user?: { name: string } }>
f.type<string>().maybeFrom('user', (ctx) => ctx.user?.name)

// Similar shorthand for possibly undefined values:
// .withContext<{ name?: string }>
f.type<string>().maybeFrom('name')
```

#### `.fixture(fixtureFn)`

`fixtureFn` receives the fully resolved attributes and a `use` function
(similar to Vitest).

You must call `use` with the fixture value _and then await the result. While
the test is runing, this will block the fixture. Once `await use()` resolves,
the fixture can cleanup any values it needs to.

```typescript
.fixture(async (attrs, use) => {
  const person = await createUser()
  await use(person)
  await deletePerson(person.id)
})
```

#### `.withValue(factoryFn)` (deprecated)

This has been replaced by the `.fixture()` method (with an API similar to
Vitest).

To avoid breaking changes, you can continue using `withValue`.

The `factoryFn` callback receives the fully resolved attributes and should return an object `{ value, destroy? }`.

```typescript
.withValue(async (attrs) => {
  const person = await createPerson()
  return {
    value: person,
    destroy: async () => {
      await destroyPerson(person.id)
    }
  }
})
```

#### `.build(attrs?, context?)`

Create a value **outside of Vitest**. Useful for scripts or setup code.

##### Using `await using` (TypeScript 5.2+)

The recommended approach uses [explicit resource management](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) to automatically dispose of the fixture when it goes out of scope:

```typescript
{
  await using user = await userFactory
    .build({ name: 'Ada' }, { company })

  // user.value is available here
  console.log(user.value.name) // 'Ada'

} // fixture is automatically disposed here (teardown runs)
```

##### Manual disposal

If you're using TypeScript < 5.2 or prefer manual control:

```typescript
const user = await userFactory
  .build({ name: 'Ada' }, { company })

console.log(user.value)

// manually clean up when done
await user[Symbol.asyncDispose]()
```

### Vitest Integration

#### `.useValue(presetAttrs?, options?)`

Return a Vitest fixture that yields **one instance**.

```typescript
const test = anyTest.extend({
  user: userFactory.useValue({ name: 'Max' }),
})
```

#### `.useCreateValue(presetAttrs?, options?)`

Return a Vitest fixture that yields a **creator function** for many instances.

```typescript
const test = anyTest.extend({
  createUser: userFactory.useCreateValue({ name: 'Default' }),
})

test('batch', async ({ createUser }) => {
  const a = await createUser({ email: 'a@ex.com' }) // merges with preset
  const b = await createUser({ name: 'Bob' })
  // ...
})
```

**Options**

```typescript
{ shouldDestroy?: boolean } // default true unless TFF_SKIP_DESTROY is truthy
```

---

## Advanced Usage

### InferFixtureValue

Use `InferFixtureValue` to extract the type of a fixture for use in helper functions:

```typescript
import { test as anyTest } from 'vitest'
import { InferFixtureValue } from 'test-fixture-factory'
import { useCompany } from './factories/company.js'
import { useCreateUser } from './factories/user.js'

// Helper function that accepts typed fixtures
const createTestUsers = async (
  company: InferFixtureValue<typeof useCompany>,
  createUser: InferFixtureValue<typeof useCreateUser>,
) => {
  const alice = await createUser({
    name: 'Alice',
    email: 'alice@example.com',
    companyId: company.id
  })
  const bob = await createUser({
    name: 'Bob',
    email: 'bob@example.com',
    companyId: company.id
  })
  return { alice, bob }
}

const test = anyTest.extend({
  company: useCompany({ name: 'Test Corp' }),
  createUser: useCreateUser(),
})

test('tests user interactions', async ({ company, createUser }) => {
  const { alice, bob } = await createTestUsers(company, createUser)
  // Test alice and bob interactions...
})

test('tests user permissions', async ({ company, createUser }) => {
  const { alice, bob } = await createTestUsers(company, createUser)
  // Test permission scenarios...
})
```

This pattern is useful for:
- Creating reusable test data setup functions
- Maintaining type safety across test helpers
- Reducing duplication in test setup code

### Environment Variables

Disable auto-destroy globally while developing:

```bash
TFF_SKIP_DESTROY=1 vitest
```

---

## Best Practices

### Vitest Integration

* Always destructure fixtures in test signatures: `test('', ({ user }) => { ... })`
* You can mix `useValue` and `useCreateValue` in the same `test.extend({ ... })`
* Cleanups run in **reverse definition order**, which plays well with FK constraints

### Factory Design

* Keep factories focused on a single entity/model
* Use `.from()` to express dependencies between fixtures
* Provide sensible defaults for optional fields
* Always include a `destroy` function when creating database records

### Type Safety

* Use `InferFixtureValue` when passing fixtures to helper functions
* Let TypeScript infer as much as possible - avoid manual type annotations
* Use `.withContext<T>()` to declare available fixtures upfront

---

## Error Handling

All missing-field errors throw `UndefinedFieldError` with a helpful message that includes the factory name:

```
[User] 1 required field(s) have undefined values:
- companyId: must be provided as an attribute or via the test context (company)
```

Detectable via `err instanceof UndefinedFieldError`.

---

## FAQ

**Q: What's the difference between `.from` and `.maybeFrom`?**
`.from` expects a value to be resolvable (via context or attribute override). `.maybeFrom` allows the context read to produce `undefined`; if nothing overrides it, you'll still get an error (because the field is required unless you `.optional()` it).

**Q: Can I read multiple fixtures for one field?**
Yes — pass an array: `.from(['a','b'], ({ a, b }) => combine(a,b))`.

**Q: Can `default(() => ...)` read the test context?**
No. Defaults are pure and receive **no** arguments. If you need context, use `.from(...)` / `.maybeFrom(...)`.

**Q: Playwright?**
You can wire factories into Playwright's `test.extend` similarly to Vitest; the fixtures you declare become available on the test context.

**Q: How do I handle circular dependencies?**
Use `.maybeFrom()` to make dependencies optional, then provide values explicitly when needed.

---

## License

MIT
