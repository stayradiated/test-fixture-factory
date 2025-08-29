import { getFnDestructuredArgs } from './get-fn-destructured-args.js'

type ContextOptions<C, V> = {
  fixtureList: string[]
  getValue: (context: C) => V | undefined
}

class FieldBuilder<Context extends object, Value, IsOptional extends boolean> {
  private context: ContextOptions<Context, Value> | undefined
  private isOptional: IsOptional

  constructor(
    context: ContextOptions<Context, Value> | undefined,
    isOptional: IsOptional,
  ) {
    this.context = context
    this.isOptional = isOptional
  }

  useContext<Deps extends object>(fn: (dep: Deps) => Value | undefined) {
    if (this.context) {
      throw new Error('Cannot call .useDep() multiple times on the same field!')
    }

    const fixtureList = getFnDestructuredArgs(fn)

    return new FieldBuilder<Context & Deps, Value, IsOptional>(
      {
        fixtureList,
        getValue: fn,
      },
      this.isOptional,
    )
  }

  optional() {
    return new FieldBuilder<Context, Value, true>(this.context, true)
  }
}

const f = {
  type<T>() {
    return new FieldBuilder<object, T, false>(undefined, false)
  },
}

export { f }
export type { FieldBuilder }
