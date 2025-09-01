import type {
  AnyField,
  AnySchema,
  AttrsOf,
  DepsOf,
  InputAttrsOf,
  Voidable,
} from './types.js'

type AnyReadableSchema = Record<string, AnyField>

const schemaEntries = <S extends AnySchema>(
  s: S,
): Array<[string, AnyField]> => {
  return Object.entries(s as unknown as AnyReadableSchema)
}
const schemaValues = <S extends AnySchema>(s: S): Array<AnyField> => {
  return Object.values(s as unknown as AnyReadableSchema)
}

const resolveDefaultValues = <S extends AnySchema>(schema: S) => {
  return Object.fromEntries(
    schemaEntries(schema).map(([key, value]) => {
      return [key, value.defaultValue]
    }),
  )
}

const resolveDeps = <S extends AnySchema>(schema: S, deps: DepsOf<S>) => {
  return Object.fromEntries(
    schemaEntries(schema)
      .filter(([_key, value]) => {
        return typeof value.context?.getValue === 'function'
      })
      .map(([key, value]) => {
        return [key, value.context?.getValue?.(deps)]
      }),
  )
}

const validateSchemaData = <S extends AnySchema>(
  schema: S,
  data: AttrsOf<S>,
): [string, AnyField][] => {
  return schemaEntries(schema).filter(([key, field]) => {
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
}

const resolveSchema = <S extends AnySchema>(
  schema: S,
  deps: DepsOf<S>,
  attrs: Voidable<InputAttrsOf<S>>,
) => {
  const result = {
    ...resolveDefaultValues(schema),
    ...resolveDeps(schema, deps),
    ...attrs,
  } as AttrsOf<S>

  return result
}

const getFixtureList = <S extends AnySchema>(schema: S): string[] => {
  const set = new Set<string>([])

  for (const field of schemaValues(schema)) {
    if (field.context) {
      for (const fixtureList of field.context.fixtureList) {
        set.add(fixtureList)
      }
    }
  }

  const list = Array.from(set)
  return list
}

export { resolveSchema, validateSchemaData, getFixtureList }
