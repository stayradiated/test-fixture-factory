# Migration Guide: v1 to v2

This is a **practical, step-by-step guide** for migrating your existing test-fixture-factory v1 code to v2.

> 📋 For a high-level overview of what changed and why, see [CHANGELOG.md](./CHANGELOG.md).

This guide focuses on the **how**—with concrete examples and fixes for common migration issues.

## Overview of Changes

### Key Differences

| Aspect            | v1                         | v2                                                                 |
|-------------------|----------------------------|--------------------------------------------------------------------|
| Entry point       | `defineFactory(fn)`        | `createFactory(name)`                                              |
| API style         | Single function            | Fluent builder API                                                 |
| Schema definition | Function parameters        | `.withSchema((f) => ({ ... }))` with field builders                |
| Dependencies      | Function parameters        | `.withContext<T>()` + **`.from(...)` / `.maybeFrom(...)`**         |
| Method names      | `useValueFn`, `useCreateFn`| **`useValue`, `useCreateValue`**                                   |
| Build signature   | `build(context, attrs)`    | **`build(attrs?, context?)`**                                      |

> Note: v2 **does not** support `.dependsOn(...)` or `.optionalDefault(...)`. Use `.from(...)` / `.maybeFrom(...)`, `.optional()`, and pure `.default(...)` instead.

---

## Step-by-Step Migration

### Step 1: Update Imports

**Before (v1):**
```ts
import { defineFactory } from 'test-fixture-factory';
````

**After (v2):**

```ts
import { createFactory } from 'test-fixture-factory';
```

---

### Step 2: Simple Factory (No Dependencies)

**Before (v1):**

```ts
const companyFactory = defineFactory(async ({}, attrs: { name: string }) => {
  const company = await prisma.company.create({ name: attrs.name });
  return {
    value: company,
    destroy: async () => await prisma.company.delete({ where: { id: company.id } })
  };
});

export const useCompany = companyFactory.useValueFn;
export const useCreateCompany = companyFactory.useCreateFn;
```

**After (v2):**

```ts
const companyFactory = createFactory('Company')
  .withSchema((f) => ({
    name: f.type<string>(),
  }))
  .withValue(async ({ name }) => {
    const company = await prisma.company.create({ data: { name } });
    return {
      value: company,
      destroy: () => prisma.company.delete({ where: { id: company.id } }),
    };
  });

export const { useValue: useCompany, useCreateValue: useCreateCompany } = companyFactory;
```

---

### Step 3: Factories with Dependencies

In v1 you received dependencies as the **first** parameter. In v2 you **declare** how fields read from context via `.from(...)` / `.maybeFrom(...)`.

**Before (v1):**

```ts
const userFactory = defineFactory(
  async ({ company }, attrs: { name: string; email: string }) => {
    const user = await prisma.user.create({
      companyId: company.id,
      name: attrs.name,
      email: attrs.email,
    });
    return { value: user, destroy: async () => prisma.user.delete({ where: { id: user.id } }) };
  }
);
```

**After (v2):**

```ts
type Company = { id: number };

const userFactory = createFactory('User')
  .withContext<{ company: Company }>()
  .withSchema((f) => ({
    companyId: f.type<number>().from('company', ({ company }) => company.id),
    name: f.type<string>(),
    email: f.type<string>(),
  }))
  .withValue(async ({ companyId, name, email }) => {
    const user = await prisma.user.create({ data: { companyId, name, email } });
    return { value: user, destroy: () => prisma.user.delete({ where: { id: user.id } }) };
  });
```

> Use `.from('key')` **without** a transform only when `Context['key']` already matches the field type. Otherwise, provide a transform `(ctx) => T`.

---

### Step 4: Default Values

Defaults are **pure** in v2 (no access to context or other fields). Use `.default(value | () => value)`.

**Before (v1):**

```ts
const productFactory = defineFactory(async ({}, attrs: {
  name: string; price?: number; active?: boolean
}) => {
  const product = await prisma.product.create({
    name: attrs.name,
    price: attrs.price ?? 99.99,
    active: attrs.active ?? true,
  });
  return { value: product };
});
```

**After (v2):**

```ts
const productFactory = createFactory('Product')
  .withSchema((f) => ({
    name: f.type<string>(),
    price: f.type<number>().default(99.99),
    active: f.type<boolean>().default(true),
  }))
  .withValue(async ({ name, price, active }) => {
    const product = await prisma.product.create({ data: { name, price, active } });
    return { value: product };
  });
```

## Advanced Migration Patterns

### Complex Dependencies

**Before (v1):**

```ts
const orderFactory = defineFactory(
  async ({ company, user }, attrs: { amount: number; productId?: number }) => {
    const order = await prisma.order.create({
      companyId: company.id,
      userId: user.id,
      amount: attrs.amount,
      productId: attrs.productId,
    });
    return { value: order };
  }
);
```

**After (v2):**

```ts
type Company = { id: number };
type User = { id: number };
type Product = { id: number };

const orderFactory = createFactory('Order')
  .withContext<{ company: Company; user: User; product?: Product }>()
  .withSchema((f) => ({
    companyId: f.type<number>().from('company', ({ company }) => company.id),
    userId: f.type<number>().from('user', ({ user }) => user.id),
    amount: f.type<number>(),
    // Optional overall; try context, otherwise allow missing
    productId: f
      .type<number>()
      .maybeFrom('product', ({ product }) => product?.id)
      .optional(),
  }))
  .withValue(async ({ companyId, userId, amount, productId }) => {
    const order = await prisma.order.create({
      data: { companyId, userId, amount, productId },
    });
    return { value: order };
  });
```

### Dynamic “Defaults” Derived from Other Attributes

In v1 you might compute a default based on another **attribute**. In v2, defaults are pure. Do one of:

* Mark the field **optional** and compute inside `.withValue(...)`, or
* Require it and let callers pass it.

**Before (v1):**

```ts
const accountFactory = defineFactory(async ({}, attrs: {
  email: string; username?: string;
}) => {
  const username = attrs.username ?? attrs.email.split('@')[0];
  const account = await createAccount({ email: attrs.email, username });
  return { value: account };
});
```

**After (v2):**

```ts
const accountFactory = createFactory('Account')
  .withSchema((f) => ({
    email: f.type<string>(),
    username: f.type<string>().optional(), // optional in input
  }))
  .withValue(async ({ email, username }) => {
    const finalUsername = username ?? email.split('@')[0];
    const account = await createAccount({ email, username: finalUsername });
    return { value: account };
  });
```

---

## Troubleshooting

### Undefined Field Errors

**Error:**

```
[User] 1 required field(s) have undefined values:
- companyId: must be provided as an attribute or via the test context (company)
```

**Fix:** Provide the field as an attribute **or** ensure the fixture is on the test context and the field reads it via `.from(...)`.

```ts
// Option 1: Provide as attribute
const user = await createUser({ companyId: 123, name: 'John', email: 'j@x.com' });

// Option 2: Ensure fixture exists and the schema reads it
const test = anyTest.extend({
  company: useCompany({ name: 'Acme' }),
  createUser: useCreateUser(),
});
```

---

### Errors with Dependencies

**Error:**

```
Property 'company' does not exist on type '{}'
```

**Fix:** Declare context shape using `.withContext()` and read via `.from(...)`.

```ts
const userFactory = createFactory('User')
  .withContext<{ company: Company }>()
  .withSchema((f) => ({
    companyId: f.type<number>().from('company', ({ company }) => company.id),
    name: f.type<string>(),
    email: f.type<string>(),
  }));
```
