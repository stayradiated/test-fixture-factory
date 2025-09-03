import type { Field, RequiredFlag } from './types.js'

type OneOrMany<T> = T | readonly T[]

// Keys in C whose value type is assignable to V
type KeysAssignableTo<C, V> = {
  [P in keyof C & string]: C[P] extends V ? P : never
}[keyof C & string]

class FieldBuilder<
  Context extends object,
  Fixtures extends keyof Context & string,
  Value,
  Flag extends RequiredFlag,
> {
  private readonly state: Field<Pick<Context, Fixtures>, Value, Flag>

  constructor(field: Field<Pick<Context, Fixtures>, Value, Flag>) {
    this.state = field
  }

  // 1) No-transform allowed only when Context[K] extends Value
  from<K extends KeysAssignableTo<Context, Value>>(
    keyOrList: OneOrMany<K>,
  ): FieldBuilder<Context, Fixtures | K, Value, 'from'>

  // 2) Otherwise, transform is required
  from<K extends keyof Context & string>(
    keyOrList: OneOrMany<K>,
    getValueFromContext: (ctx: Pick<Context, K>) => Value,
  ): FieldBuilder<Context, Fixtures | K, Value, 'from'>

  // Implementation
  from<K extends keyof Context & string>(
    keyOrList: OneOrMany<K>,
    fn?: (ctx: Pick<Context, K>) => Value,
  ) {
    const [key, fixtureList]: [K, K[]] = Array.isArray(keyOrList)
      ? [keyOrList[0], keyOrList]
      : [keyOrList, [keyOrList]]

    const getValueFromContext =
      fn ?? ((ctx: Pick<Context, K>) => ctx[key] as Value)

    return new FieldBuilder<Context, Fixtures | K, Value, 'from'>({
      ...this.state,
      isRequired: true,
      fixtureList,
      getValueFromContext,
    })
  }

  // No-transform allowed when Context[K] extends Value | undefined
  maybeFrom<K extends KeysAssignableTo<Context, Value | undefined>>(
    keyOrList: OneOrMany<K>,
  ): FieldBuilder<Context, Fixtures | K, Value, 'maybeFrom'>

  // Otherwise, transform required
  maybeFrom<K extends keyof Context & string>(
    keyOrList: OneOrMany<K>,
    getValueFromContext: (ctx: Pick<Context, K>) => Value | undefined,
  ): FieldBuilder<Context, Fixtures | K, Value, 'maybeFrom'>

  // Implementation
  maybeFrom<K extends keyof Context & string>(
    keyOrList: OneOrMany<K>,
    fn?: (ctx: Pick<Context, K>) => Value | undefined,
  ) {
    const [key, fixtureList]: [K, K[]] = Array.isArray(keyOrList)
      ? [keyOrList[0], keyOrList]
      : [keyOrList, [keyOrList]]

    const getValueFromContext =
      fn ?? ((ctx: Pick<Context, K>) => ctx[key] as Value | undefined)

    return new FieldBuilder<Context, Fixtures | K, Value, 'maybeFrom'>({
      ...this.state,
      isRequired: true,
      fixtureList,
      getValueFromContext,
    })
  }

  optional() {
    return new FieldBuilder<Context, Fixtures, Value | undefined, 'optional'>({
      ...this.state,
      isRequired: false,
    })
  }

  default(defaultValue: Value | (() => Value)) {
    return new FieldBuilder<Context, Fixtures, Value, 'default'>({
      ...this.state,
      isRequired: true,
      defaultValue,
    })
  }
}

type NewFieldBuilder<Context extends object> = {
  type: <T>() => FieldBuilder<Context, never, T, 'required'>
}

const createFieldBuilder = <
  Context extends object = object,
>(): NewFieldBuilder<Context> => ({
  type<T>() {
    return new FieldBuilder<Context, never, T, 'required'>({
      fixtureList: [],
      isRequired: true,
      defaultValue: undefined,
      getValueFromContext: undefined,
    })
  },
})

export { createFieldBuilder, FieldBuilder }
export type { NewFieldBuilder }
