import { describe, expectTypeOf, test } from 'vitest'

import type {
  CreateValueFn,
  CreateValueInput,
  PresetInput,
  UseCreateValueFixture,
  UseValueFixture,
  VitestFixtureFn,
} from './index.js'

import { createFactory } from './index.js'

type User = { id: number; name: string; role: 'admin' | 'member' }
type UserInput = {
  id?: number | undefined
  name: string
  role: 'admin' | 'member'
}
type UserCreator = CreateValueFn<CreateValueInput<UserInput>, User>

describe('public fixture types', () => {
  test('names useValue and useCreateValue results with required input', () => {
    const factory = createFactory<User>('User')
      .withSchema((f) => ({
        id: f.type<number>().default(1),
        name: f.type<string>(),
        role: f.type<'admin' | 'member'>(),
      }))
      .fixture(async ({ id, name, role }, use) => use({ id, name, role }))

    const useValue: UseValueFixture<object, User> = factory.useValue({
      name: 'Ada',
      role: 'admin',
    })
    const useCreate: UseCreateValueFixture<object, UserCreator> =
      factory.useCreateValue()

    expectTypeOf(useValue).toEqualTypeOf<VitestFixtureFn<object, User>>()
    expectTypeOf(useCreate).toEqualTypeOf<
      UseCreateValueFixture<object, UserCreator>
    >()
  })

  test('makes preset keys optional while retaining other required input', () => {
    type PresetUserCreator = CreateValueFn<
      CreateValueInput<PresetInput<UserInput, { name: string }>>,
      User
    >
    const factory = createFactory<User>('User')
      .withSchema((f) => ({
        id: f.type<number>().default(1),
        name: f.type<string>(),
        role: f.type<'admin' | 'member'>(),
      }))
      .fixture(async ({ id, name, role }, use) => use({ id, name, role }))

    const useCreate: UseCreateValueFixture<object, PresetUserCreator> =
      factory.useCreateValue({ name: 'Ada' })

    expectTypeOf(useCreate).toEqualTypeOf<
      UseCreateValueFixture<object, PresetUserCreator>
    >()
  })

  test('permits void for empty and all-optional creator input', () => {
    type EmptyCreator = CreateValueFn<
      CreateValueInput<Record<string, never>>,
      number
    >
    type OptionalCreator = CreateValueFn<
      CreateValueInput<{ id?: number | undefined }>,
      number
    >
    const emptyFactory = createFactory<number>('Empty').fixture(
      async (_, use) => use(1),
    )
    const optionalFactory = createFactory<number>('Optional')
      .withSchema((f) => ({ id: f.type<number>().default(1) }))
      .fixture(async ({ id }, use) => use(id))

    const empty: UseCreateValueFixture<object, EmptyCreator> =
      emptyFactory.useCreateValue()
    const optional: UseCreateValueFixture<object, OptionalCreator> =
      optionalFactory.useCreateValue()

    const emptyAttrs: Parameters<EmptyCreator>[0] = undefined
    const optionalAttrs: Parameters<OptionalCreator>[0] = undefined
    expectTypeOf<void>().toMatchTypeOf<typeof emptyAttrs>()
    expectTypeOf<void>().toMatchTypeOf<typeof optionalAttrs>()
    expectTypeOf(empty).toEqualTypeOf<
      UseCreateValueFixture<object, EmptyCreator>
    >()
    expectTypeOf(optional).toEqualTypeOf<
      UseCreateValueFixture<object, OptionalCreator>
    >()
  })

  test('preserves from and maybeFrom fixture context', () => {
    type Context = { account: { id: number }; locale?: string }
    type Value = { accountId: number; locale: string | undefined }
    type ContextCreator = CreateValueFn<
      CreateValueInput<{
        accountId?: number | undefined
        locale?: string | undefined
      }>,
      Value
    >
    const factory = createFactory<Value>('Contextual')
      .withContext<Context>()
      .withSchema((f) => ({
        accountId: f
          .type<number>()
          .from('account', ({ account }) => account.id),
        locale: f.type<string>().maybeFrom('locale'),
      }))
      .fixture(async ({ accountId, locale }, use) => use({ accountId, locale }))

    const useCreate: UseCreateValueFixture<Context, ContextCreator> =
      factory.useCreateValue()

    expectTypeOf(useCreate).toEqualTypeOf<
      UseCreateValueFixture<Context, ContextCreator>
    >()
  })
})
