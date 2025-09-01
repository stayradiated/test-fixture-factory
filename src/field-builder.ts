import { getFnDestructuredArgs } from './get-fn-destructured-args.js'
import type { RequiredFlag } from './types.js'

type ContextOptions<C, V> = {
  fixtureList: string[]
  getValue: (context: C) => V | undefined
}

class FieldBuilder<Context extends object, Value, Flag extends RequiredFlag> {
  private readonly context: ContextOptions<Context, Value> | undefined
  private readonly isRequired: Flag extends 'required' ? true : false
  private readonly defaultValue: Value | undefined

  constructor(
    context: ContextOptions<Context, Value> | undefined,
    isRequired: Flag extends 'required' ? true : false,
    defaultValue: Value | undefined,
  ) {
    this.context = context
    this.isRequired = isRequired
    this.defaultValue = defaultValue
  }

  useContext<Deps extends object>(fn: (dep: Deps) => Value | undefined) {
    if (this.context) {
      throw new Error('Cannot call .useDep() multiple times on the same field!')
    }

    const fixtureList = getFnDestructuredArgs(fn)

    return new FieldBuilder<Context & Deps, Value, Flag>(
      {
        fixtureList,
        getValue: fn,
      },
      this.isRequired,
      this.defaultValue,
    )
  }

  optional() {
    return new FieldBuilder<Context, Value | undefined, 'optional'>(
      this.context,
      false,
      this.defaultValue,
    )
  }

  default(defaultValue: Value) {
    return new FieldBuilder<Context, Value, 'optional'>(
      this.context,
      false,
      defaultValue,
    )
  }
}

const f = {
  type<T>() {
    return new FieldBuilder<object, T, 'required'>(undefined, true, undefined)
  },
}

export { f }
export type { FieldBuilder }
