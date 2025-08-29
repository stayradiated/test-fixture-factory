import { defineFixture } from './define-fixture.js'
import { SKIP_DESTROY } from './env-var.js'
import type {
  CreateFn,
  DestroyFn,
  Factory,
  FactoryInputFn,
  FactoryOptions,
} from './types.js'

const defaultFactoryOptions: FactoryOptions = {
  shouldDestroy: !SKIP_DESTROY,
}

const defineFactory = <
  Deps extends Record<string, unknown>,
  // biome-ignore lint/suspicious/noConfusingVoidType: void is used to indicate optional attributes
  Attrs extends void | Record<string, unknown>,
  Value,
>(
  factoryFn: FactoryInputFn<Deps, Attrs, Value>,
): Factory<Deps, Attrs, Value> => {
  // cast input function to a factory, so we can assign additional properties
  const factory = factoryFn as Factory<Deps, Attrs, Value>

  factory.useCreateFn = (
    defaultAttrs: Partial<Attrs> = {},
    options: FactoryOptions = defaultFactoryOptions,
  ) =>
    defineFixture(factoryFn, async (deps, use) => {
      const destroyList: DestroyFn[] = []

      const createFn: CreateFn<Attrs, Value> = async (attrs) => {
        const { value, destroy } = await factoryFn(deps, {
          ...defaultAttrs,
          ...attrs,
        })
        if (destroy) {
          destroyList.push(destroy)
        }
        return value
      }

      await use(createFn)

      if (options?.shouldDestroy) {
        for (const destroy of destroyList) {
          await destroy()
        }
      }
    })

  factory.useValueFn = (attrs, options = defaultFactoryOptions) =>
    defineFixture(factoryFn, async (deps, use) => {
      const { value, destroy } = await factoryFn(deps, attrs)
      await use(value)
      if (options.shouldDestroy) {
        await destroy?.()
      }
    })

  return factory
}

export { defineFactory }
