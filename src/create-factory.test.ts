import { describe, test } from 'vitest'

import { createFactory } from './create-factory.js'

type User = {
  name: string
  accountId: number
}

const getFactory = () => {
  const state = {
    isDestroyed: false,
  }

  const factory = createFactory<User>('User')
    .withContext<{
      name?: string
      accountId?: number
    }>()
    .withSchema((f) => ({
      name: f
        .type<string>()
        .maybeFrom('name', ({ name }) => name)
        .default('Unknown'),
      accountId: f
        .type<number>()
        .maybeFrom('accountId', ({ accountId }) => accountId)
        .default(-1),
    }))
    .fixture(async (attrs, use) => {
      const { name, accountId } = attrs

      await use({
        name,
        accountId,
      })

      state.isDestroyed = true
    })

  return {
    factory,
    state,
  }
}

describe('build', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    {
      await using user = await factory.build()
      expect(user.value).toStrictEqual({ name: 'Unknown', accountId: -1 })
      expect(state.isDestroyed).toBe(false)
    }

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    const { factory, state } = getFactory()

    {
      await using user = await factory.build(
        {},
        {
          name: 'Gregg',
          accountId: 33,
        },
      )
      expect(user.value).toStrictEqual({ name: 'Gregg', accountId: 33 })
      expect(state.isDestroyed).toBe(false)
    }

    expect(state.isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    {
      await using user = await factory.build({
        name: 'Joseph',
        accountId: 42,
      })

      expect(user.value).toStrictEqual({ name: 'Joseph', accountId: 42 })
      expect(state.isDestroyed).toBe(false)
    }

    expect(state.isDestroyed).toBe(true)
  })
})

describe('useCreateValue', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue()

    await useCreate({}, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Unknown', accountId: -1 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue()

    await useCreate({ name: 'Gregg', accountId: 33 }, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Gregg', accountId: 33 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue()

    await useCreate({}, async (create) => {
      const result = await create({ name: 'Joseph', accountId: 42 })
      expect(result).toStrictEqual({ name: 'Joseph', accountId: 42 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with default attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue({
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
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue({
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
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue()

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
    const { factory, state } = getFactory()

    const useCreate = factory.useCreateValue({}, { shouldDestroy: false })

    await useCreate({}, async (create) => {
      const result = await create()
      expect(result).toStrictEqual({ name: 'Unknown', accountId: -1 })

      expect(state.isDestroyed).toBe(false)
    })

    // should not be destroyed
    expect(state.isDestroyed).toBe(false)
  })
})

describe('useValue', () => {
  test('without dependencies or attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useValue = factory.useValue({})

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Unknown', accountId: -1 })
      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useValue = factory.useValue({})

    await useValue({ name: 'Hannah', accountId: 27 }, async (value) => {
      expect(value).toStrictEqual({ name: 'Hannah', accountId: 27 })
      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useValue = factory.useValue({ name: 'Zachary', accountId: 99 })

    await useValue({}, async (value) => {
      expect(value).toStrictEqual({ name: 'Zachary', accountId: 99 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('with dependencies and attributes', async ({ expect }) => {
    const { factory, state } = getFactory()

    const useValue = factory.useValue({ name: 'Zoe' })

    await useValue({ accountId: 42 }, async (value) => {
      expect(value).toStrictEqual({ name: 'Zoe', accountId: 42 })

      expect(state.isDestroyed).toBe(false)
    })

    expect(state.isDestroyed).toBe(true)
  })

  test('should not destroy values if shouldDestroy is false', async ({
    expect,
  }) => {
    const { factory, state } = getFactory()

    const useValue = factory.useValue({}, { shouldDestroy: false })

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

  const accountFactory = createFactory<Account>('Account')
    .withSchema((f) => ({
      id: f.type<number>().default(() => Math.floor(Math.random() * 10000000)),
      name: f.type<string>().default('Test Account'),
    }))
    .fixture(async ({ id, name }, use) =>
      use({
        id,
        name,
      }),
    )

  type Person = {
    id: number
    accountId: number
    name: string
  }

  const personFactory = createFactory<Person>('Person')
    .withContext<{ account?: Account }>()
    .withSchema((f) => ({
      id: f.type<number>().default(() => Math.floor(Math.random() * 10000000)),
      accountId: f
        .type<number>()
        .maybeFrom('account', ({ account }) => account?.id),
      name: f.type<string>().default('Test Person'),
    }))
    .fixture(({ id, accountId, name }, use) =>
      use({
        id,
        accountId,
        name,
      }),
    )

  const myTest = test.extend({
    account: accountFactory.useValue({}),
    person: personFactory.useValue({}),

    createAccount: accountFactory.useCreateValue(),
    createPerson: personFactory.useCreateValue(),
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
