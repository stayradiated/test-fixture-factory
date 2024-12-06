type DestroyFn = () => Promise<void>

type VitestFixtureFn<Deps, Value> = (
  deps: Deps,
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

type CreateFn<Attrs, Value> = (attrs: Attrs) => Promise<Value>

type Factory<Deps, Attrs, Value> = FactoryInputFn<Deps, Attrs, Value> & {
  useCreateFn: () => VitestFixtureFn<Deps, CreateFn<Attrs, Value>>
  useValueFn: (attrs: Attrs) => VitestFixtureFn<Deps, Value>
}

export type { VitestFixtureFn, FactoryInputFn, Factory, DestroyFn, CreateFn }
