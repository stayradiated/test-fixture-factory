import type { FieldBuilder } from './field-builder.js'

type RequiredFlag = 'required' | 'optional'

type Field<Context extends object, Value, Flag extends RequiredFlag> = {
  context:
    | {
        fixtureList: string[]
        getValue: (deps: Context) => Value | undefined
      }
    | undefined
  isRequired: Flag extends 'required' ? true : false
  defaultValue: Value | undefined
}

// biome-ignore lint/suspicious/noExplicitAny: this is ok
type FieldOf<FB extends FieldBuilder<any, any, any>> = FB extends FieldBuilder<
  infer Context,
  infer Value,
  infer Flag
>
  ? Field<Context, Value, Flag>
  : never

// biome-ignore lint/suspicious/noExplicitAny: this is ok
type AnyField = Field<any, any, any>
// biome-ignore lint/suspicious/noExplicitAny: this is ok
type AnyFieldBuilder = FieldBuilder<any, any, any>

type AnySchema = Record<string, AnyFieldBuilder>

type DestroyFn = () => Promise<void>

type VitestFixtureFn<Context, Value> = (
  context: object & Context,
  use: (value: Value) => Promise<void>,
) => Promise<void>

/*
 * Utility for extending fixtures manually
 */

type InferFixtureValue<T> = T extends (
  // biome-ignore lint/suspicious/noExplicitAny: this is ok
  ...args: any[]
) => VitestFixtureFn<infer _Context, infer Value>
  ? Value
  : never

type FactoryResult<Value> = {
  value: Value
  destroy?: DestroyFn
}

type FactoryFn<Context extends object, Attrs, Value> = (
  context: Context,
  attrs: Attrs,
) => Promise<FactoryResult<Value>> | FactoryResult<Value>

type FactoryOptions = {
  // if true, the factory will destroy the created values after the test
  // defaults to true, unless TFF_SKIP_DESTROY env var is set
  shouldDestroy?: boolean
}

type OptionalKeysOf<BaseType extends object> = BaseType extends unknown
  ? keyof {
      [Key in keyof BaseType as BaseType extends Record<Key, BaseType[Key]>
        ? never
        : Key]: never
    } &
      keyof BaseType
  : never

type RequiredKeysOf<BaseType extends object> = BaseType extends unknown
  ? Exclude<keyof BaseType, OptionalKeysOf<BaseType>>
  : never

type Voidable<T extends object> = RequiredKeysOf<T> extends never ? T | void : T

type CreateFn<Attrs extends object, Value> = (
  attrs: Voidable<Attrs>,
) => Promise<Value>

type UseCreateFn<S extends AnySchema, Value> = {
  // no preset attrs → must provide all attrs at runtime
  (
    presetAttrs?: void | undefined,
    options?: FactoryOptions,
  ): VitestFixtureFn<DepsOf<S>, CreateFn<InputAttrsOf<S>, Value>>

  // complete preset attrs → no attrs needed at runtime (can call with void/empty)
  <PresetAttrs extends AttrsOf<S>>(
    presetAttrs: PresetAttrs,
    options?: FactoryOptions,
  ): VitestFixtureFn<
    DepsOf<S>,
    (attrs?: void | Record<string, never>) => Promise<Value>
  >

  // partial preset attrs → must provide remaining attrs at runtime
  <PresetAttrs extends Partial<InputAttrsOf<S>>>(
    presetAttrs: PresetAttrs,
    options?: FactoryOptions,
  ): VitestFixtureFn<
    DepsOf<S>,
    CreateFn<Omit<InputAttrsOf<S>, keyof PresetAttrs>, Value>
  >
}

type UseValueFn<S extends AnySchema, Value> = (
  attrs: Voidable<InputAttrsOf<S>>,
  options?: FactoryOptions,
) => VitestFixtureFn<DepsOf<S>, Value>

type Factory<S extends AnySchema, Value> = FactoryFn<
  DepsOf<S>,
  AttrsOf<S>,
  Value
> & {
  useCreateFn: UseCreateFn<S, Value>
  useValueFn: UseValueFn<S, Value>
}

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type UnionToIntersection<U> = (
  U extends unknown
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never

type AttrOf<F extends AnyField> = F extends Field<infer _C, infer V, infer _F>
  ? V
  : never

type DepOf<F extends AnyField> = F extends Field<infer C, infer _V, infer _F>
  ? C
  : never

type AttrsOf<S extends AnySchema> = {
  [K in keyof S]: AttrOf<FieldOf<S[K]>>
}

type DepsOf<S extends AnySchema> = Prettify<
  UnionToIntersection<DepOf<FieldOf<S[keyof S]>>>
>

type IsFieldRequired<F extends AnyField> = F extends Field<
  infer _C,
  infer _V,
  infer F
>
  ? F extends 'required'
    ? true
    : false
  : never

// does this field have any dependency keys?
type HasDep<F extends AnyField> = [keyof DepOf<F>] extends [never]
  ? false
  : true

// keys that are optional in INPUT (either optional() OR has dep)
type OptionalKeysFromSchema<S extends AnySchema> = {
  [K in keyof S]: IsFieldRequired<FieldOf<S[K]>> extends true
    ? HasDep<FieldOf<S[K]>> extends true
      ? K
      : never
    : K
}[keyof S]

// keys that are required in INPUT (not optional and no dep)
type RequiredKeysFromSchema<S extends AnySchema> = Exclude<
  keyof S,
  OptionalKeysFromSchema<S>
>

type InputAttrsOf<S extends AnySchema> = Prettify<
  { [K in RequiredKeysFromSchema<S>]: AttrOf<FieldOf<S[K]>> } & {
    [K in OptionalKeysFromSchema<S>]?: AttrOf<FieldOf<S[K]>>
  }
>

export type {
  AnyField,
  Field,
  VitestFixtureFn,
  FactoryFn,
  Factory,
  DestroyFn,
  CreateFn,
  InferFixtureValue,
  FactoryOptions,
  UseValueFn,
  UseCreateFn,
  FactoryResult,
  AttrsOf,
  DepsOf,
  AnySchema,
  InputAttrsOf,
  Voidable,
  RequiredFlag,
}
