import { describe, test } from 'vitest'
import { defineFactory } from './define-factory.js'
import { f } from './field-builder.js'

const createFactory = () => {
  const state = {
    isDestroyed: false,
  }

  const factory = defineFactory(
    'User',
    {
      name: f
        .type<string>()
        .default('Unknown')
        .useContext(({ name }: { name?: string }) => name),
      accountId: f
        .type<number>()
        .default(-1)
        .useContext(({ accountId }: { accountId?: number }) => accountId),
    },
    ({ name, accountId }) => {
      const value = {
        name,
        accountId,
      }
      return {
        value,
        destroy: async () => {
          state.isDestroyed = true
        },
      }
    },
  )

  return {
    factory,
    state,
  }
}

describe('useCreateFn', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn()

    await useCreate({}, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Unknown', accountId: -1 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn()

    await useCreate({ name: 'Gregg', accountId: 33 }, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Gregg', accountId: 33 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn()

    await useCreate({}, async (create) => {
      const result = await create({ name: 'Joseph', accountId: 42 })
      expect(result).toStrictEqual({ name: 'Joseph', accountId: 42 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with default attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn({
      name: 'Joseph',
      accountId: 1,
    })

    await useCreate({}, async (create) => {
      const result = await create({})
      expect(result).toStrictEqual({ name: 'Joseph', accountId: 1 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with default attributes and attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn({
      accountId: 1,
    })

    await useCreate({}, async (create) => {
      const result = await create({
        name: 'Josephine',
      })
      expect(result).toStrictEqual({ name: 'Josephine', accountId: 1 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies and attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn()

    await useCreate({ accountId: 27 }, async (create) => {
      const result = await create({ name: 'Josephine' })
      expect(result).toStrictEqual({ name: 'Josephine', accountId: 27 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('should not destroy values if shouldDestroy is false', async ({
    expect,
  }) => {
    const { factory, state } = createFactory()

    const useCreate = factory.useCreateFn({}, { shouldDestroy: false })

    await useCreate({}, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Unknown', accountId: -1 })

      expect(state.isDestroyed).toBe(false)
    })

    // should not be destroyed
    expect(state.isDestroyed).toBe(false)
  })
})

describe('useValueFn', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useValue = factory.useValueFn({})

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Unknown', accountId: -1 })
      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useValue = factory.useValueFn({})

    await useValue({ name: 'Hannah', accountId: 27 }, async (value) => {
      expect(value).toStrictEqual({ name: 'Hannah', accountId: 27 })
      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useValue = factory.useValueFn({ name: 'Zachary', accountId: 99 })

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Zachary', accountId: 99 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies and attributes', async ({ expect }) => {
    const { factory, state } = createFactory()

    const useValue = factory.useValueFn({ name: 'Zoe' })

    await useValue({ accountId: 42 }, async (value) => {
      expect(value).toStrictEqual({ name: 'Zoe', accountId: 42 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('should not destroy values if shouldDestroy is false', async ({
    expect,
  }) => {
    const { factory, state } = createFactory()

    const useValue = factory.useValueFn({}, { shouldDestroy: false })

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Unknown', accountId: -1 })

      expect(state.isDestroyed).toBe(false)
    })

    // should not be destroyed
    expect(state.isDestroyed).toBe(false)
  })
})

describe('vitest.extend', () => {
  type Account = {
    id: number
    name: string
  }

  const accountFactory = defineFactory(
    'Account',
    {
      name: f.type<string>().optional(),
    },
    async ({ name }) => {
      return {
        value: {
          id: Math.floor(Math.random() * 10000000),
          name: name ?? 'Test Account',
        },
      }
    },
  )

  type Person = {
    id: number
    accountId: number
    name: string
  }

  const personFactory = defineFactory(
    'Person',
    {
      accountId: f
        .type<number>()
        .useContext(
          ({ account }: { account?: Pick<Account, 'id'> }) => account?.id,
        ),
      name: f.type<string>().optional(),
    },
    ({ accountId, name }) => {
      const person: Person = {
        id: Math.floor(Math.random() * 10000000),
        accountId: accountId,
        name: name ?? 'Test Person',
      }

      return {
        value: person,
      }
    },
  )

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
