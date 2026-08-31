import type {
  CreateValueFn,
  CreateValueInput,
  Factory,
  UseCreateValueFixture,
  UseValueFixture,
} from '../index.js'

import { createFactory } from '../create-factory.js'

type User = { id: number; name: string }
type UserInput = { id?: number | undefined; name: string }
type CreateUser = CreateValueFn<CreateValueInput<UserInput>, User>

const userFactory: Factory<object, UserInput, User> = createFactory<User>(
  'User',
)
  .withSchema((f) => ({
    id: f.type<number>().default(() => Math.floor(Math.random() * 1_000_000)),
    name: f.type<string>(),
  }))
  .fixture(async ({ id, name }, use) => use({ id, name }))

const useUser: UseValueFixture<object, User> = userFactory.useValue({
  name: 'Ada',
})
const useCreateUser: UseCreateValueFixture<object, CreateUser> =
  userFactory.useCreateValue()

export { useCreateUser, userFactory, useUser }
