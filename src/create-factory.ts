import type { NewFieldBuilder } from './field.js'
import type {
  AnySchema,
  AnySchemaBuilderWithContext,
  BuiltFixture,
  EmptySchema,
  FactoryFixtureFn,
  InputOf,
  MaybeVoid,
  OutputOf,
  Prettify,
  SchemaOf,
  SetSchemaFieldsOptional,
  UseCreateValueFixture,
  UseValueFixture,
  VoidableInputOf,
} from './types.js'

import {
  createSchema,
  resolveSchema,
  validateSchemaData,
} from './schema-utils.js'
import { UndefinedFieldError } from './undefined-field-error.js'
import { wrapFixtureFn } from './wrap-fixture-fn.js'

type FactoryState<S extends AnySchema, V> = {
  name: string
  schema: S
  fixtureFn: FactoryFixtureFn<Prettify<OutputOf<S>>, V> | undefined
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
      fixtureFn: undefined,
      schema: createSchema<Context>().with(schemaFn),
    })
  }

  fixture(fixtureFn: FactoryFixtureFn<Prettify<OutputOf<Schema>>, Value>) {
    return new FactoryBuilder<Context, Schema, Value>({
      ...this.state,
      fixtureFn,
    })
  }

  async build(
    attrs: VoidableInputOf<Schema>,
    context: MaybeVoid<Context>,
  ): Promise<BuiltFixture<Value>> {
    const { name, schema, fixtureFn } = this.state

    if (!fixtureFn) {
      throw new Error('.fixture() must be called before .build()')
    }

    const data = resolveSchema(schema, context ?? {}, attrs)
    const errorList = validateSchemaData(schema, data)
    if (errorList.length > 0) {
      throw new UndefinedFieldError(name, errorList)
    }

    const blockUntilValue = Promise.withResolvers<Value>()
    const blockUntilDispose = Promise.withResolvers<void>()

    const useFn = async (value: Value) => {
      blockUntilValue.resolve(value)
      await blockUntilDispose.promise
    }

    const factoryPromise = fixtureFn(data, useFn)
    const value = await blockUntilValue.promise

    return {
      get value() {
        return value
      },
      [Symbol.asyncDispose]: async () => {
        blockUntilDispose.resolve()
        await factoryPromise
      },
    }
  }

  useCreateValue<
    PresetAttrs extends void | undefined | Partial<InputOf<Schema>>,
  >(
    presetAttrs?: PresetAttrs,
  ): UseCreateValueFixture<
    Context,
    CreateFn<
      SetSchemaFieldsOptional<Schema, keyof PresetAttrs & keyof Schema>,
      Value
    >
  > {
    const { name, schema, fixtureFn } = this.state

    if (!fixtureFn) {
      throw new Error('.fixture() must be called before .useCreateValue()')
    }

    return wrapFixtureFn(schema, async (context, use) => {
      const destroyList: Array<() => Promise<void>> = []

      await use((async (attrs) => {
        // Merge preset attributes with provided attributes
        // Provided attributes override preset attributes
        const data = resolveSchema(schema, context, {
          ...(presetAttrs ?? {}),
          ...attrs,
        } as unknown as InputOf<Schema>)

        const errorList = validateSchemaData(schema, data)
        if (errorList.length > 0) {
          throw new UndefinedFieldError(name, errorList)
        }

        const blockUntilValue = Promise.withResolvers<Value>()
        const blockUntilDispose = Promise.withResolvers<void>()

        const useFn = async (value: Value) => {
          blockUntilValue.resolve(value)
          await blockUntilDispose.promise
        }
        const factoryPromise = fixtureFn(data, useFn)

        destroyList.push(async () => {
          blockUntilDispose.resolve()
          await factoryPromise
        })

        const value = await blockUntilValue.promise
        return value
      }) satisfies CreateFn<
        SetSchemaFieldsOptional<Schema, keyof PresetAttrs & keyof Schema>,
        Value
      >)

      for (const destroy of destroyList) {
        await destroy()
      }
    })
  }

  useValue(attrs: VoidableInputOf<Schema>): UseValueFixture<Context, Value> {
    const { name, schema, fixtureFn } = this.state

    if (!fixtureFn) {
      throw new Error('.fixture() must be called before .useValue()')
    }

    return wrapFixtureFn(schema, async (context, use) => {
      const data = resolveSchema(schema, context, attrs)
      const errorList = validateSchemaData(schema, data)
      if (errorList.length > 0) {
        throw new UndefinedFieldError(name, errorList)
      }

      const blockUntilValue = Promise.withResolvers<Value>()
      const blockUntilDispose = Promise.withResolvers<void>()

      const useFn = async (value: Value) => {
        blockUntilValue.resolve(value)
        await blockUntilDispose.promise
      }

      const factoryPromise = fixtureFn(data, useFn)

      const value = await blockUntilValue.promise
      await use(value)

      blockUntilDispose.resolve()
      await factoryPromise
    })
  }
}

const createFactory = <Value = unknown>(name: string) => {
  if (name.trim().length === 0) {
    throw new Error('createFactory: name should be a non-empty string')
  }

  return new FactoryBuilder<object, EmptySchema, Value>({
    name,
    schema: {},
    fixtureFn: undefined,
  })
}

export { createFactory }
