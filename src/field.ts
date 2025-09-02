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

  optional() {
    return new FieldBuilder<Context, Fixtures, Value | undefined, 'optional'>({
      ...this.state,
      isRequired: false,
    })
  }

  dependsOn<NextFixtures extends keyof Context & string>(
    ...keys: NextFixtures[]
  ) {
    if (this.state.fixtureList.length > 0) {
      throw new Error(
        'Cannot call .dependsOn() multiple times on the same field!',
      )
    }
    if (typeof this.state.defaultValue !== 'undefined') {
      throw new Error('Cannot call .dependsOn() after .default()!')
    }

    return new FieldBuilder<Context, NextFixtures, Value, Flag>({
      ...this.state,
      fixtureList: keys,
      defaultValue: undefined,
    })
  }

  default(defaultValue: Value | ((ctx: Pick<Context, Fixtures>) => Value)) {
    return new FieldBuilder<Context, Fixtures, Value, 'optional'>({
      ...this.state,
      isRequired: false,
      defaultValue,
    })
  }

  optionalDefault(
    defaultValue: (ctx: Pick<Context, Fixtures>) => Value | undefined,
  ) {
    return new FieldBuilder<Context, Fixtures, Value, Flag>({
      ...this.state,
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
    })
  },
})

export { createFieldBuilder, FieldBuilder }
export type { NewFieldBuilder }
