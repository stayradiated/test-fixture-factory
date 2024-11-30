import { describe, test } from 'vitest'
import { defineFactory } from './define-factory.js'

describe('useCreateFn', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      Record<string, unknown>,
      Record<string, unknown>,
      { name: string }
    >(async () => {
      const value = {
        name: 'Rosie',
      }
      return {
        value,
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useCreate = factory.useCreateFn()

    await useCreate({}, async (create) => {
      const result = await create({})
      expect(result).toStrictEqual({ name: 'Rosie' })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      { name: string },
      Record<string, unknown>,
      { name: string }
    >(async ({ name }) => {
      const value = {
        name,
      }
      return {
        value,
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useCreate = factory.useCreateFn()

    await useCreate({ name: 'Gregg' }, async (create) => {
      const result = await create({})
      expect(result).toStrictEqual({ name: 'Gregg' })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      Record<string, unknown>,
      { name: string },
      { name: string }
    >(async (_deps, { name }) => {
      const value = {
        name,
      }
      return {
        value,
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useCreate = factory.useCreateFn()

    await useCreate({}, async (create) => {
      const result = await create({ name: 'Joseph' })
      expect(result).toStrictEqual({ name: 'Joseph' })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with dependencies and attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      { accountId: number },
      { name: string },
      { accountId: number; name: string }
    >(async ({ accountId }, { name }) => {
      const value = {
        accountId,
        name,
      }
      return {
        value,
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useCreate = factory.useCreateFn()

    await useCreate({ accountId: 27 }, async (create) => {
      const result = await create({ name: 'Josephine' })
      expect(result).toStrictEqual({ name: 'Josephine', accountId: 27 })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })
})

describe('useValueFn', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      Record<string, never>,
      Record<string, never>,
      { name: string }
    >(async () => {
      return {
        value: {
          name: 'Samuel',
        },
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useValue = factory.useValueFn({})

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Samuel' })
      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      { name: string },
      Record<string, never>,
      { name: string }
    >(async ({ name }) => {
      return {
        value: {
          name,
        },
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useValue = factory.useValueFn({})

    await useValue({ name: 'Hannah' }, async (value) => {
      expect(value).toStrictEqual({ name: 'Hannah' })
      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      Record<string, unknown>,
      { name: string },
      { name: string }
    >(async (_deps, { name }) => {
      const value = {
        name,
      }
      return {
        value,
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useValue = factory.useValueFn({ name: 'Zachary' })

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Zachary' })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })

  test('with dependencies and attributes', async ({ expect }) => {
    let isDestroyed = false

    const factory = defineFactory<
      { accountId: number },
      { name: string },
      { accountId: number; name: string }
    >(async ({ accountId }, { name }) => {
      return {
        value: {
          accountId,
          name,
        },
        destroy: async () => {
          isDestroyed = true
        },
      }
    })

    const useValue = factory.useValueFn({ name: 'Zoe' })

    await useValue({ accountId: 42 }, async (value) => {
      expect(value).toStrictEqual({ name: 'Zoe', accountId: 42 })

      expect(isDestroyed).toBe(false)
    })

    expect(isDestroyed).toBe(true)
  })
})

describe('vitest.extend', () => {
  type Account = {
    id: number
    name: string
  }

  const accountFactory = defineFactory<
    Record<string, unknown>,
    Partial<Omit<Account, 'id'>>,
    Account
  >(
    // biome-ignore lint/correctness/noEmptyPattern: vitest requires {}
    async ({}, attrs) => {
      return {
        value: {
          id: Math.floor(Math.random() * 10000000),
          name: attrs.name ?? 'Test Account',
        },
      }
    },
  )

  type Person = {
    id: number
    accountId: number
    name: string
  }

  const personFactory = defineFactory<
    { account: Account },
    Partial<Omit<Person, 'id'>>,
    Person
  >(async ({ account }, attrs) => {
    return {
      value: {
        id: Math.floor(Math.random() * 10000000),
        accountId: attrs?.accountId ?? account.id,
        name: attrs.name ?? 'Test Person',
      },
    }
  })

  const myTest = test.extend({
    account: accountFactory.useValueFn({}),
    person: personFactory.useValueFn({}),

    createAccount: accountFactory.useCreateFn(),
    createPerson: personFactory.useCreateFn(),
  })

  myTest(
    'should create a person with an existing account',
    async ({ account, createPerson, expect }) => {
      const person = await createPerson({ name: 'Maxine' })
      expect(person).toStrictEqual({
        id: expect.any(Number),
        accountId: account.id,
        name: 'Maxine',
      })
    },
  )

  myTest(
    'should provide an existing person and account',
    async ({ account, person, expect }) => {
      expect(person).toStrictEqual({
        id: expect.any(Number),
        accountId: account.id,
        name: 'Test Person',
      })
    },
  )

  myTest(
    'should create a new account with a new person',
    async ({ createAccount, createPerson, expect }) => {
      const account = await createAccount({})
      const person = await createPerson({ name: 'Milo', accountId: account.id })
      expect(person).toStrictEqual({
        id: expect.any(Number),
        accountId: account.id,
        name: 'Milo',
      })
    },
  )
})
