# test-fixture-factory

`test-fixture-factory` is an NPM package designed to streamline the creation and management of test fixtures within TypeScript projects using **Vitest** [Test Contexts](https://vitest.dev/guide/test-context.html). This library leverages structured factory functions to generate test data and manage the lifecycle of these fixtures efficiently, making your tests more organized, repeatable, and maintainable.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Why Use test-fixture-factory?](#why-use-test-fixture-factory)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Defining a Factory](#defining-a-factory)
  - [Using Factories in Tests](#using-factories-in-tests)
  - [Destroying Resources](#destroying-resources)
- [API](#api)
- [License](#license)

## Installation

To add `test-fixture-factory` to your project, run:

```bash
npm add --save-dev test-fixture-factory
```

Ensure you have `vitest` set up as your test runner since this package is designed to work with it.

## Features

- **Define Factories:** Easily define factories for creating fixtures with dependencies and attributes.
- **Lifecycle Management:** Automatically manage the creation and destruction of test resources.
- **Integration with Vitest:** Seamlessly integrates with Vitest's testing functions.

Here’s a brief example illustrating a feature:

```typescript
import { defineFactory } from 'test-fixture-factory';

const companyFactory = defineFactory(async ({}, attrs: { name: string }) => {
  const company = await prisma.company.create({
    name: attrs.name,
  });

  return {
    value: company,
    destroy: async () => {
      await prisma.company.delete({ where: { id: company.id } });
    },
  };
});
```

## Why Use test-fixture-factory?

Testing with accurate and meaningful data is crucial for ensuring that your code behaves as expected. `test-fixture-factory` simplifies the process of setting up data for tests by providing:

- **Simplicity:** Avoid boilerplate code and manually setting up test data.
- **Consistency:** Ensure that each test runs with predictable and manageable data setup.
- **Isolation:** Prevent test case interference by cleaning up after tests automatically.
- **Robustness:** Handle complex dependencies among fixtures with ease.

## Getting Started

### Requirements

- [Node.js (v20 or later)](https://nodejs.org/)
- [Vitest](https://vitest.dev/) (may also work with [Playwright](https://playwright.dev/))

### Setup

1. Install the package using npm:
    ```bash
    npm install test-fixture-factory
    ```
2. Ensure `vitest` is installed and configured in your project.

## Usage

### Defining a Factory

To define a factory, use the `defineFactory` function. A factory is a function that takes dependencies and attributes to produce a test value.

#### Without any Dependencies

```typescript
import { defineFactory } from 'test-fixture-factory';

import type { Company } from 'prisma'

type Dependencies = {}; // Alternatively as `Record<string, unknown>`

type Attributes = {
  name: string
}

const companyFactory = defineFactory(
  async ({}: Dependencies, attrs: Attributes): Company => {
    const company = await prisma.company.create({
      name: attrs.name,
    });

    return {
      value: company,
      destroy: async () => {
        await prisma.company.delete({ where: { id: company.id } });
      }
    };
  });

export const useCompany = companyFactory.useValueFn;
export const useCreateCompany = companyFactory.useCreateFn;
```

#### With Dependencies

```typescript
import { defineFactory } from 'test-fixture-factory';

import type { Company, User } from 'prisma'

type Dependencies = {
  company: Company
}

type Attributes = {
  name: string
  email: string
}

const userFactory = defineFactory(
  async ({ company }: Dependencies, attrs: Attributes): User => {

    const user = await prisma.user.create({
      company: company.id,
      name: attrs.name,
      email: attrs.email,
    });

    return {
      value: user,
      destroy: async () => {
        await prisma.user.delete({ where: { id: user.id } });
      }
    };
  });

export const useUser = userFactory.useValueFn;
export const useCreateUser = userFactory.useCreateFn;
```

### Using Factories in Tests

Factories can be used to create or directly retrieve values in test functions.
Dependencies such as `company` in the example below are automatically passed into factory functions
through Vitest's [Fixture Initialization](https://vitest.dev/guide/test-context.html#fixture-initialization).

```typescript
import { test as anyTest, expect } from 'vitest';

import { useCompany } from './factories/company.js'
import { useCreateUser } from './factories/user.js'

const test = anyTest.extend({
    company: useCompany({ name: 'Crinkle' }),
    createUser: useCreateUser()
});

test('it creates a user', async ({ company, createUser }) => {
  const alice = await createUser({ name: 'Alice', email: 'alice@example.com' });
  const bob = await createUser({ name: 'Bob', email: 'bob@example.com' });

  expect(alice).toEqual({
    id: expect.any(Number),
    companyId: company.id,
    name: 'Alice',
    email: 'alice@example.com',
  });

  expect(bob).toEqual({
    id: expect.any(Number),
    companyId: company.id,
    name: 'Bob',
    email: 'bob@example.com',
  });

  /**
   * Note: once this test has completed, alice and bob will both be removed
   * from the database.
   */
});
```

### Reusing Fixtures

```typescript
import { test as anyTest, expect } from "vitest";

import { InferCreateFn } from "test-fixture-factory";
import { useCompany } from "./factories/company.js";
import { useCreateUser } from "./factories/user.js";

const createFixtures = async ({
  createUser,
}: {
  createUser: InferCreateFn<typeof useCreateUser>;
}) => {
  const alice = await createUser({ name: "Alice", email: "alice@example.com" });
  const bob = await createUser({ name: "Bob", email: "bob@example.com" });

  return { alice, bob };
};

const test = anyTest.extend({
  company: useCompany(),
  createUser: useCreateUser(),
});

test("tests something", async ({ company, createUser }) => {
  const { alice, bob } = await createFixtures({ createUser });
  // ...
});

test("tests something else", async ({ company, createUser }) => {
  const { alice, bob } = await createFixtures({ createUser });
  // ...
});
```

### Destroying Resources

Factories ensure resources are destroyed properly after use. This avoids any residual data that might affect subsequent tests. Each factory can optionally specify a `destroy` function to clean up resources.
Since `destroy` is called in the reverse order of fixture definition, this should avoid any dependency conflicts (e.g. mandatory foreign key relationships in database tables).

### Resource Cleanup Control

There are two ways to control whether resources are automatically cleaned up after tests:

#### Environment Variable

You can set the `TFF_SKIP_DESTROY` environment variable to any non-empty value to globally disable resource cleanup:

```bash
TFF_SKIP_DESTROY=1 npm test
```

This is useful during development when you want to inspect the state of resources after tests run.

#### Per-Factory Options

You can also control cleanup behavior at the factory level using the `shouldDestroy` option:

```typescript
// Disable cleanup for a specific useValueFn call
const test = anyTest.extend({
  company: useCompany({}, { shouldDestroy: false }),
  createCompany: useCreateCompany({ shouldDestroy: false })
});
```

The `shouldDestroy` option:
- Defaults to `true` unless `TFF_SKIP_DESTROY` is set
- Can be passed to both `useValueFn` and `useCreateFn`
- Takes precedence over the `TFF_SKIP_DESTROY` environment variable

This granular control is useful when:
- You need to keep certain resources for inspection after specific tests
- You want to manage cleanup manually
- You're debugging specific test scenarios

## API

### `defineFactory(factoryFn)`

**Parameters:**

- `factoryFn`: A function that produces the fixture, taking dependencies and attributes, and returns an object containing the value and an optional `destroy` function.

**Returns:**

- The `defineFactory` function returns the same `factoryFn` that was passed in. However, this function now has extra methods available on it:  `useCreateFn` and `useValueFn`.

- **`useCreateFn`**: Provides a function to create instances of the fixture with managed lifecycle.
- **`useValueFn(attrs)`**: Directly retrieves a fixture value, managing the lifecycle automatically.

## License

This package is [MIT licensed](LICENSE).
