import { test as anyTest } from 'vitest'

import {
  useCreateUser,
  userFactory,
  useUser,
} from './explicit-fixture-types.js'

const test = anyTest.extend({
  user: useUser,
  createUser: useCreateUser,
})

test('explicitly typed useValue provides its annotated value', ({
  expect,
  user,
}) => {
  expect(user).toStrictEqual({
    id: expect.any(Number),
    name: 'Ada',
  })
})

test('explicitly typed useCreateValue provides its annotated creator', async ({
  createUser,
  expect,
}) => {
  const user = await createUser({ name: 'Grace' })

  expect(user).toStrictEqual({
    id: expect.any(Number),
    name: 'Grace',
  })
})

test('explicitly typed factory builds values', async ({ expect }) => {
  await using user = await userFactory.build({ name: 'Lin' }, {})

  expect(user.value).toStrictEqual({
    id: expect.any(Number),
    name: 'Lin',
  })
})
