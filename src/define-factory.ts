import type { CreateFn, DestroyFn, Factory, FactoryInputFn } from './types.js'

import { defineFixture } from './define-fixture.js'

const defineFactory = <Deps, Attrs, Value>(
  factoryFn: FactoryInputFn<Deps, Attrs, Value>,
): Factory<Deps, Attrs, Value> => {
  // cast input function to a factory, so we can assign additional properties
  const factory = factoryFn as Factory<Deps, Attrs, Value>

  factory.useCreateFn = () =>
    defineFixture(factoryFn, async (deps, use) => {
      const destroyList: DestroyFn[] = []

      const createOrganizationFn: CreateFn<Attrs, Value> = async (attrs) => {
        const { value, destroy } = await factoryFn(deps, attrs)
        if (destroy) {
          destroyList.push(destroy)
        }
        return value
      }

      await use(createOrganizationFn)

      for (const destroy of destroyList) {
        await destroy()
      }
    })

  factory.useValueFn = (attrs) =>
    defineFixture(factoryFn, async (deps, use) => {
      const { value, destroy } = await factoryFn(deps, attrs)
      await use(value)
      await destroy?.()
    })

  return factory
}

export { defineFactory }
