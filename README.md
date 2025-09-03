# test-fixture-factory

`test-fixture-factory` helps you create **typed, ergonomic test fixtures** for **Vitest** using a fluent factory API. Define attributes and defaults once, declare what can be read from the test context, and get clean fixtures with automatic teardown.

* ✅ **First-class TypeScript**: schema-driven, end-to-end inference
* ✅ **Explicit context reads**: `.from()` / `.maybeFrom()` link fields to fixtures on the test context
* ✅ **Lifecycle control**: auto-destroy by default, opt-out via env or per-fixture
* ✅ **Great DX**: actionable errors (with factory names and missing fields)

> Works best with [Vitest Test Contexts](https://vitest.dev/guide/test-context.html). It can also be used outside Vitest via `factory.build(...)` for ad-hoc creation.

---

## Installation

```bash
npm i -D test-fixture-factory
````

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
  .withValue(async ({ name }) => {
    const company = await prisma.company.create({ data: { name } })
    return {
      value: company,
      destroy: () => prisma.company.delete({ where: { id: company.id } }),
    }
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

## Concepts

* **Factory**: built via `createFactory(name)` + `.withSchema()` + `.withValue()`
* **Schema fields**: declared with `f.type<T>()` and refined with:

  * `.optional()` — mark the field optional
  * `.default(value | () => value)` — supply a default; makes field optional for **input**
  * `.from('fixture' | ['a','b'], (ctx) => T)` — read **required** value(s) from test context (see overloads below)
  * `.maybeFrom('fixture' | ['a','b'], (ctx) => T | undefined)` — read **optional** value(s) from context; if it resolves to `undefined` and no attribute overrides it, you’ll get a helpful error
* **Fixtures**: Vitest fixtures returned by `.useValue(...)` or `.useCreateValue(...)`
* **Teardown**: Provide `destroy()` in `.withValue()` to auto-cleanup after each test

---

## How values are resolved

Given a schema, the attributes passed to `.withValue()` are resolved in this order (later wins):

1. **Defaults** from `.default(...)`
2. **Context values** from `.from(...)` / `.maybeFrom(...)`
3. **Preset attributes** from `.useValue(preset)` or `.useCreateValue(preset)`
4. **Call-time attributes** passed to the `create()` function (only with `.useCreateValue()`)

Undefined keys are removed; later sources win.

> If a field is **required** and resolves to `undefined`, you’ll get an `UndefinedFieldError` telling you which field was missing and which fixture(s) could have provided it.

---

## API Reference

### `createFactory(name: string)` → `FactoryBuilder`

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
.type<string>().optional()

// Field with default value
.type<string>().default('hello world')

// Field with calculated default value
.type<number>().default(() => Math.random())

// Read from context:
// .withContext<{ user: { name: string } }>
.type<string>().from('user', (ctx) => ctx.user.name)

// Shorthand when the type already matches
// .withContext<{ name: string }>
.type<string>().from('name')

// Optional read from context (may return undefined):
// .withContext<{ user?: { name: string } }>
.type<string>().maybeFrom('user', (ctx) => ctx.user.name)

// Similar shorthand for possibly undefined values:
// .withContext<{ name?: string }>
.type<string>().maybeFrom('name')
```

#### `.withValue(factoryFn)`

`factoryFn` receives the fully resolved attributes and returns `{ value, destroy? }`.

```typescript
.withValue(async (attrs) => ({ value: await createInDb(attrs) }))
```

#### `.build(attrs?, context?)`

Create a value **outside of Vitest**. Useful for scripts or setup code.

```typescript
const { value, destroy } = await userFactory
  .withContext<{ company: Company }>()
  .withSchema(/* ... */)
  .withValue(/* ... */)
  .build({ name: 'Ada' }, { company })
```

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

test('batch', async ({ createUser, expect }) => {
  const a = await createUser({ email: 'a@ex.com' }) // merges with preset
  const b = await createUser({ name: 'Bob' })
  expect(a).toBeTruthy(); expect(b).toBeTruthy()
})
```

**Options**

```typescript
{ shouldDestroy?: boolean } // default true unless TFF_SKIP_DESTROY is truthy
```

#### Environment variable

Disable auto-destroy globally while developing:

```bash
TFF_SKIP_DESTROY=1 vitest
```

---

## Vitest Integration Tips

* Always destructure fixtures in test signatures: `test('', ({ user }) => { ... })`
* You can mix `useValue` and `useCreateValue` in the same `test.extend({ ... })`
* Cleanups run in **reverse definition order**, which plays well with FK constraints

---

## Error Handling

All missing-field errors throw `UndefinedFieldError` with a helpful message that includes the factory name, e.g.:

```
[User] 1 required field(s) have undefined values:
- companyId: must be provided as an attribute or via the test context (company)
```

Detectable via `err instanceof UndefinedFieldError`.

---

## FAQ

**Q: What’s the difference between `.from` and `.maybeFrom`?**
`.from` expects a value to be resolvable (via context or attribute override). `.maybeFrom` allows the context read to produce `undefined`; if nothing overrides it, you’ll still get an error (because the field is required unless you `.optional()` it).

**Q: Can I read multiple fixtures for one field?**
Yes — pass an array: `.from(['a','b'], ({ a, b }) => combine(a,b))`.

**Q: Can `default(() => ...)` read the test context?**
No. Defaults are pure and receive **no** arguments. If you need context, use `.from(...)` / `.maybeFrom(...)`.

**Q: Playwright?**
You can wire factories into Playwright’s `test.extend` similarly to Vitest; the fixtures you declare become available on the test context.

---

## License

MIT
