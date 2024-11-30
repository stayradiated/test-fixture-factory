# test-fixture-factory

`test-fixture-factory` is an NPM package designed to streamline the creation and management of test fixtures within TypeScript projects using Vitest. This library leverages structured factory functions to generate test data and manage the lifecycle of these fixtures efficiently, making your tests more organized, repeatable, and maintainable.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Defining a Factory](#defining-a-factory)
  - [Using Factories in Tests](#using-factories-in-tests)
  - [Destroying Resources](#destroying-resources)
- [API](#api)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

To add `test-fixture-factory` to your project, run the following command:

```bash
npm install test-fixture-factory
```

Ensure you have `vitest` set up as your test runner since this package is designed to work with it.

## Features

- **Define Factories:** Easily define factories for creating fixtures with dependencies and attributes.
- **Lifecycle Management:** Automatically manage the creation and destruction of test resources.
- **Integration with Vitest:** Seamlessly integrates with Vitest's testing functions.

## Getting Started

This section helps you set up `test-fixture-factory` in your project.

### Requirements

- Node.js
- Vitest

### Setup

1. Install the package using npm:
    ```bash
    npm install test-fixture-factory
    ```

2. Ensure `vitest` is installed and configured in your project.

## Usage

### Defining a Factory

To define a factory, use the `defineFactory` function. A factory is a function that takes dependencies and attributes to produce a test value.

```typescript
import { defineFactory } from 'test-fixture-factory';

const userFactory = defineFactory<
  { companyId: number },
  { name: string; age: number },
  { id: number; companyId: number; name: string; age: number }
>(async ({ companyId }, { name, age }) => {
  return {
    value: {
      id: Math.floor(Math.random() * 1000),
      companyId,
      name,
      age
    },
    destroy: async () => {
      // logic to clean up this user, perhaps deleting from a database
    }
  }
});
```

### Using Factories in Tests

Factories can be used to create or directly retrieve values in test functions.

```typescript
import { test } from 'vitest';

test('it creates a user', async ({ expect }) => {
  const createCompany = async () => ({ id: 42 }); // Mocked company creation
  const company = await createCompany();

  await userFactory.useCreateFn()({ companyId: company.id }, async (createUser) => {
    const user = await createUser({ name: 'Alice', age: 30 });
    expect(user).toMatchObject({
      companyId: company.id,
      name: 'Alice',
      age: 30
    });
  });
});
```

### Destroying Resources

Factories ensure resources are destroyed properly after use. This avoids any residual data that might affect subsequent tests.

## API

### `defineFactory(factoryFn)`

**Parameters:**

- `factoryFn`: A function that produces the fixture, taking dependencies and attributes, and returns an object containing the value and an optional `destroy` function.

### Returns

- A factory object with `useCreateFn` and `useValueFn` methods.

### Methods

- **`useCreateFn`**: Provides a function to create instances of the fixture with managed lifecycle.
- **`useValueFn(attrs)`**: Directly retrieves a fixture value, managing the lifecycle automatically.

## Examples

### Basic Example

```typescript
const productFactory = defineFactory(
  async () => ({
    value: { name: 'Widget', price: 99.99 }
  })
);

test('product factory', async ({ expect }) => {
  await productFactory.useValueFn({})({}, async (product) => {
    expect(product).toMatchObject({ name: 'Widget', price: 99.99 });
  });
});
```

### Complex Example with Dependencies

Refer to the detailed test examples provided within the test files in this project.

## Contributing

Contributions are welcome! Please check out the [contribution guidelines](CONTRIBUTING.md).

## License

This package is [MIT licensed](LICENSE). Feel free to use as per the terms outlined.
