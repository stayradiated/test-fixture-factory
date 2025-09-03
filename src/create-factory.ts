import type { NewFieldBuilder } from './field.js'
import type {
  AnySchema,
  AnySchemaBuilderWithContext,
  DestroyFn,
  FactoryFn,
  FactoryOptions,
  InputOf,
  MaybeVoid,
  OutputOf,
  Prettify,
  SchemaOf,
  VitestFixtureFn,
  VoidableInputOf,
} from './types.js'

import { SKIP_DESTROY } from './env-var.js'
import {
  createSchema,
  resolveSchema,
  validateSchemaData,
} from './schema-utils.js'
import { UndefinedFieldError } from './undefined-field-error.js'
import { wrapFixtureFn } from './wrap-fixture-fn.js'

const defaultFactoryOptions: FactoryOptions = {
  shouldDestroy: !SKIP_DESTROY,
}

type FactoryState<S extends AnySchema, V> = {
  name: string
  schema: S
  factoryFn: FactoryFn<Prettify<OutputOf<S>>, V> | undefined
}

type CreateFn<Schema extends AnySchema, Value> = (
  attrs: VoidableInputOf<Schema>,
) => Promise<Value>

class FactoryBuilder<Context extends object, Schema extends AnySchema, Value> {
  private readonly state: FactoryState<Schema, Value>

  constructor(state: FactoryState<Schema, Value>) {
    this.state = state
    this.useCreateValue = this.useCreateValue.bind(this)
    this.useValue = this.useValue.bind(this)
  }

  withContext<Context extends object>() {
    return new FactoryBuilder<Context, Schema, Value>(this.state)
  }

  withSchema<SchemaBuilder extends AnySchemaBuilderWithContext<Context>>(
    schemaFn: (f: NewFieldBuilder<Context>) => SchemaBuilder,
  ) {
    return new FactoryBuilder<Context, SchemaOf<SchemaBuilder>, Value>({
      ...this.state,
      factoryFn: undefined,
      schema: createSchema<Context>().with(schemaFn),
    })
  }

  withValue<Value>(factoryFn: FactoryFn<Prettify<OutputOf<Schema>>, Value>) {
    return new FactoryBuilder<Context, Schema, Value>({
      ...this.state,
      factoryFn,
    })
  }

  async build(attrs: VoidableInputOf<Schema>, context: MaybeVoid<Context>) {
    const { name, schema, factoryFn } = this.state

    if (!factoryFn) {
      throw new Error('.withValue() must be called before .build()')
    }

    const data = resolveSchema(schema, context ?? {}, attrs)
    const errorList = validateSchemaData(schema, data)
    if (errorList.length > 0) {
      throw new UndefinedFieldError(name, errorList)
    }

    const { value, destroy } = await factoryFn(data)

    return {
      value,
      destroy: destroy ?? (() => Promise.resolve()),
    }
  }

  useCreateValue<
    PresetAttrs extends void | undefined | Partial<InputOf<Schema>>,
  >(
    presetAttrs?: PresetAttrs,
    { shouldDestroy }: FactoryOptions = defaultFactoryOptions,
  ): VitestFixtureFn<
    Context,
    CreateFn<Omit<Schema, keyof PresetAttrs>, Value>
  > {
    const { name, schema, factoryFn } = this.state

    if (!factoryFn) {
      throw new Error('.withValue() must be called before .useCreateValue()')
    }

    return wrapFixtureFn(schema, async (context, use) => {
      const destroyList: DestroyFn[] = []

      await use((async (attrs) => {
        const data = resolveSchema(schema, context, {
          ...(presetAttrs ?? {}),
          ...attrs,
        } as unknown as InputOf<Schema>)

        const errorList = validateSchemaData(schema, data)
        if (errorList.length > 0) {
          throw new UndefinedFieldError(name, errorList)
        }

        const { value, destroy } = await factoryFn(data)

        if (destroy) {
          destroyList.push(destroy)
        }

        return value
      }) satisfies CreateFn<Omit<Schema, keyof PresetAttrs>, Value>)

      if (shouldDestroy) {
        for (const destroy of destroyList) {
          await destroy()
        }
      }
    })
  }

  useValue(
    attrs: VoidableInputOf<Schema>,
    options: FactoryOptions = defaultFactoryOptions,
  ): VitestFixtureFn<Context, Value> {
    const { name, schema, factoryFn } = this.state
    const { shouldDestroy } = options

    if (!factoryFn) {
      throw new Error('.withValue() must be called before .useValue()')
    }

    return wrapFixtureFn(schema, async (context, use) => {
      const data = resolveSchema(schema, context, attrs)
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
  }
}

const createFactory = (name: string) => {
  if (name.trim().length === 0) {
    throw new Error('createFactory: name should be a non-empty string')
  }

  return new FactoryBuilder<object, AnySchema, unknown>({
    name,
    schema: {},
    factoryFn: undefined,
  })
}

export { createFactory }
