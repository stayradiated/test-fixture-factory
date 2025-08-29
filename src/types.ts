type DestroyFn = () => Promise<void>

type VitestFixtureFn<Deps, Value> = (
  deps: Record<string, unknown> & Deps,
  use: (value: Value) => Promise<void>,
) => Promise<void>

type FactoryOutput<Value> = {
  value: Value
  destroy?: DestroyFn
}

type FactoryInputFn<Deps, Attrs, Value> = (
  deps: Deps,
  attrs: Attrs,
) => Promise<FactoryOutput<Value>> | FactoryOutput<Value>

type FactoryOptions = {
  // if true, the factory will destroy the created values after the test
  // defaults to true, unless TFF_SKIP_DESTROY env var is set
  shouldDestroy?: boolean
}

type CreateFn<Attrs, Value> = (attrs: Attrs) => Promise<Value>

type Factory<
  Deps extends Record<string, unknown>,
  // biome-ignore lint/suspicious/noConfusingVoidType: void is used to indicate optional attributes
  Attrs extends void | Record<string, unknown>,
  Value,
> = FactoryInputFn<Deps, Attrs, Value> & {
  useCreateFn: (
    defaultAttrs?: Partial<Attrs>,
    options?: FactoryOptions,
  ) => VitestFixtureFn<Deps, CreateFn<Attrs, Value>>
  useValueFn: (
    attrs: Attrs,
    options?: FactoryOptions,
  ) => VitestFixtureFn<Deps, Value>
}

type InferFixtureValue<T> = T extends () => VitestFixtureFn<
  infer _Deps,
  infer Value
>
  ? Value
  : never

export type {
  VitestFixtureFn,
  FactoryInputFn,
  Factory,
  DestroyFn,
  CreateFn,
  InferFixtureValue,
  FactoryOptions,
}
