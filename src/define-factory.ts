import { SKIP_DESTROY } from './env-var.js'
import { resolveSchema, validateSchemaData } from './schema-utils.js'
import type {
  AnySchema,
  AttrsOf,
  DestroyFn,
  Factory,
  FactoryOptions,
  FactoryResult,
  InputAttrsOf,
  UseCreateFn,
  UseValueFn,
} from './types.js'
import { UndefinedFieldError } from './undefined-field-error.js'
import { wrapFixtureFn } from './wrap-fixture-fn.js'

const defaultFactoryOptions: FactoryOptions = {
  shouldDestroy: !SKIP_DESTROY,
}

const defineFactory = <S extends AnySchema, Value>(
  name: string,
  schema: S,
  factoryFn: (
    options: AttrsOf<S>,
  ) => Promise<FactoryResult<Value>> | FactoryResult<Value>,
): Factory<S, Value> => {
  const useCreateFn: UseCreateFn<S, Value> = (
    presetAttrs?: Partial<InputAttrsOf<S>> | void,
    { shouldDestroy } = defaultFactoryOptions,
  ) =>
    wrapFixtureFn(schema, async (deps, use) => {
      const destroyList: DestroyFn[] = []

      await use(async (attrs: Partial<InputAttrsOf<S>>) => {
        const data = resolveSchema(schema, deps, {
          ...presetAttrs,
          ...attrs,
        } as InputAttrsOf<S>)

        const errorList = validateSchemaData(schema, data)
        if (errorList.length > 0) {
          throw new UndefinedFieldError(name, errorList)
        }

        const { value, destroy } = await factoryFn(data)

        if (destroy) {
          destroyList.push(destroy)
        }
        return value
      })

      if (shouldDestroy) {
        for (const destroy of destroyList) {
          await destroy()
        }
      }
    })

  const useValueFn: UseValueFn<S, Value> = (
    attrs,
    { shouldDestroy } = defaultFactoryOptions,
  ) =>
    wrapFixtureFn(schema, async (deps, use) => {
      const data = resolveSchema(schema, deps, attrs)
      const errorList = validateSchemaData(schema, data)
      if (errorList.length > 0) {
        throw new UndefinedFieldError(name, errorList)
      }

      const { value, destroy } = await factoryFn(data)
      await use(value)
      if (shouldDestroy) {
        await destroy?.()
      }
    })

  // cast input function to a factory, so we can assign additional properties
  const factory = factoryFn as unknown as Factory<S, Value>
  factory.useCreateFn = useCreateFn
  factory.useValueFn = useValueFn
  return factory
}

export { defineFactory }
