import type { NewFieldBuilder } from './field.js'
import type {
  AnySchema,
  AnySchemaBuilderWithContext,
  AnySchemaWithContext,
  FieldOf,
  MissingField,
  OutputOf,
  Prettify,
  SchemaOf,
  VoidableInputOf,
} from './types.js'

import { createFieldBuilder } from './field.js'

const createSchema = <Context extends object = object>() => ({
  empty: () => {
    return {}
  },
  with: <SchemaBuilder extends AnySchemaBuilderWithContext<Context>>(
    schemaFn: (f: NewFieldBuilder<Context>) => SchemaBuilder,
  ): Prettify<SchemaOf<SchemaBuilder>> => {
    return schemaFn(
      createFieldBuilder<Context>(),
    ) as unknown as SchemaOf<SchemaBuilder>
  },
})

const deleteUndefinedKeys = <T>(value: T): T => {
  for (const key in value) {
    if (value[key] === undefined) {
      delete value[key]
    }
  }
  return value
}

const schemaEntries = <S extends AnySchema>(
  s: S,
): Array<[string, FieldOf<S>]> => {
  return Object.entries(s).map(([key, value]) => [
    key,
    (value as unknown as { state: FieldOf<S> }).state,
  ])
}

const schemaValues = <S extends AnySchema>(s: S): Array<FieldOf<S>> => {
  return Object.values(s).map(
    (value) => (value as unknown as { state: FieldOf<S> }).state,
  )
}

const resolveDefaultValues = <S extends AnySchema>(schema: S) => {
  return deleteUndefinedKeys(
    Object.fromEntries(
      schemaEntries(schema).map(([key, value]) => {
        return [key, value.defaultValue]
      }),
    ),
  )
}

const resolveFixtures = <
  Context extends object,
  Schema extends AnySchemaWithContext<Context>,
>(
  schema: Schema,
  context: Context,
) => {
  return deleteUndefinedKeys(
    Object.fromEntries(
      schemaEntries(schema)
        .filter(([_key, value]) => {
          return typeof value.fromContext === 'function'
        })
        .map(([key, value]) => {
          return [key, value.fromContext?.(context)]
        }),
    ),
  )
}

const validateSchemaData = <S extends AnySchema>(
  schema: S,
  data: OutputOf<S>,
): MissingField[] => {
  return schemaEntries(schema)
    .filter(([key, field]) => {
      // ignore optional fields
      if (!field.isRequired) {
        return false
      }
      // ignore fields that are already defined
      if (typeof data[key] !== 'undefined') {
        return false
      }
      return true
    })
    .map(([key, field]) => ({
      key,
      fixtureList: field.fixtureList,
    }))
}

const resolveSchema = <
  Context extends object,
  Schema extends AnySchemaWithContext<Context>,
>(
  schema: Schema,
  context: Context,
  attrs: VoidableInputOf<Schema>,
) => {
  const result = {
    ...resolveDefaultValues(schema),
    ...resolveFixtures(schema, context),
    ...deleteUndefinedKeys({ ...attrs }),
  } as OutputOf<Schema>

  return result
}

const getFixtureList = <Schema extends AnySchema>(schema: Schema): string[] => {
  const set = new Set<string>([])

  for (const field of schemaValues(schema)) {
    for (const fixtureList of field.fixtureList) {
      set.add(fixtureList)
    }
  }

  const list = Array.from(set)
  return list
}

export { createSchema, resolveSchema, validateSchemaData, getFixtureList }
