import type { Field, RequiredFlag } from './types.js'

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

  dependsOn<NextFixtures extends keyof Context & string>(
    ...keys: NextFixtures[]
  ) {
    if (this.state.fixtureList.length > 0) {
      throw new Error(
        'Cannot call .dependsOn() multiple times on the same field!',
      )
    }
    if (this.state.fromContext) {
      throw new Error('Cannot call .dependsOn() after .use()!')
    }

    return new FieldBuilder<Context, NextFixtures, Value, Flag>({
      ...this.state,
      fixtureList: keys,
      fromContext: undefined,
    })
  }

  use(fn: (ctx: Pick<Context, Fixtures>) => Value | undefined) {
    if (this.state.fromContext) {
      throw new Error('Cannot call .use() multiple times on the same field!')
    }
    if (this.state.fixtureList.length === 0) {
      throw new Error('Cannot call .use() before .dependsOn()!')
    }

    return new FieldBuilder<Context, Fixtures, Value, Flag>({
      ...this.state,
      fromContext: fn,
    })
  }

  optional() {
    return new FieldBuilder<Context, Fixtures, Value | undefined, 'optional'>({
      ...this.state,
      isRequired: false,
    })
  }

  default(defaultValue: Value) {
    return new FieldBuilder<Context, Fixtures, Value, 'optional'>({
      ...this.state,
      isRequired: false,
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
      fromContext: undefined,
      isRequired: true,
      defaultValue: undefined,
    })
  },
})

export { createFieldBuilder, FieldBuilder }
export type { NewFieldBuilder }
