import type { FieldBuilder } from './field.js'

/* UTILITY TYPES */

// collapse a stacked type into a simpler one
type Prettify<T> = { [K in keyof T]: T[K] } & {}

/* FIELD TYPES */

type RequiredFlag = 'required' | 'optional' | 'default' | 'from' | 'maybeFrom'

/* FIELD */

type Field<Fixtures extends object, Value, Flag extends RequiredFlag> = {
  fixtureList: (keyof Fixtures & string)[]
  getValueFromContext: undefined | ((ctx: Fixtures) => Value | undefined)
  isRequired: Flag extends 'required'
    ? true
    : Flag extends 'default'
      ? true
      : Flag extends 'from'
        ? true
        : Flag extends 'maybeFrom'
          ? true
          : Flag extends 'optional'
            ? false
            : true
  defaultValue: undefined | Value | (() => Value)
}

// cast a FieldBuilder to a Field
type AsField<F extends FieldBuilder<any, any, any, any>> =
  F extends FieldBuilder<infer Context, infer Fixtures, infer Value, infer Flag>
    ? Field<Prettify<Pick<Context, Fixtures>>, Value, Flag>
    : never

/* SCHEMA */

type AnySchemaBuilder = Record<string, FieldBuilder<any, any, any, any>>

// Get the clean schema out of a schema builder record
type SchemaOf<SchemaBuilder extends AnySchemaBuilder> = {
  [K in keyof SchemaBuilder]: AsField<SchemaBuilder[K]>
}

/* ANY FIELD */

type AnySchemaBuilderWithContext<Context extends object> = Record<
  string,
  FieldBuilder<Context, any, any, any>
>

type AnyField = Field<any, any, any>

type AnyFieldWithContext<Context extends object> = Field<Context, any, any>

type FieldOf<Schema extends AnySchema> = Schema[keyof Schema]

type AnySchema = Record<string, AnyFieldWithContext<any>>
type EmptySchema = Record<string, never>

type AnySchemaWithContext<Context extends object> = Record<
  string,
  AnyFieldWithContext<Context>
>

/* VALIDATE SCHEMA */

// returned by validateSchemaData to indicate missing field
type MissingField = {
  key: string
  fixtureList: string[]
}

/* VITEST FIXTURE */

type DestroyFn = () => Promise<void> | void

type VitestFixtureFn<Context, FixtureValue> = (
  context: object & Context,
  use: (value: FixtureValue) => Promise<void>,
) => Promise<void>

/*
 * @deprecated Use the `use` callback instead of returning a value from the
 * factory function.
 */
type FactoryResult<Value> = {
  value: Value
  destroy?: DestroyFn
}

/*
 * @deprecated
 */
type FactoryFn<Attrs extends object, Value> = (
  attrs: Attrs,
) => Promise<FactoryResult<Value>> | FactoryResult<Value>

type FixtureFn<Attrs extends object, Value> = (
  attrs: Attrs,
  use: (value: Value) => Promise<void>,
) => Promise<void>

type FactoryOptions = {
  // if true, the factory will destroy the created values after the test
  // defaults to true, unless TFF_SKIP_DESTROY env var is set
  shouldDestroy?: boolean
}

/* SCHEMA FIELD HELPERS */

// extract the value type of a field
type ValueOf<S extends AnySchema, K extends keyof S> = S[K] extends Field<
  infer _C,
  infer Value,
  infer _F
>
  ? Value
  : never

// extract the fixtures of a field
type FixturesOf<S extends AnySchema, K extends keyof S> = S[K] extends Field<
  infer Fixtures,
  infer _V,
  infer _F
>
  ? Fixtures
  : never

// get the flag of a field
type FlagOf<S extends AnySchema, K extends keyof S> = S[K] extends Field<
  infer _F,
  infer _V,
  infer Flag
>
  ? Flag
  : never

// keys that are flagged as 'optional' in the schema
type OptionalOutputKeysOf<Schema extends AnySchema> = {
  [Key in keyof Schema]: FlagOf<Schema, Key> extends 'optional' ? Key : never
}[keyof Schema]

// keys that are flagged as 'required' in the schema
type RequiredOutputKeysOf<Schema extends AnySchema> = Exclude<
  keyof Schema,
  OptionalOutputKeysOf<Schema>
>

// keys that are optional in INPUT (either .optional() / .from() / .default())
type OptionalInputKeysOf<S extends AnySchema> = {
  [K in keyof S]: FlagOf<S, K> extends
    | 'optional'
    | 'default'
    | 'from'
    | 'maybeFrom'
    ? K
    : never
}[keyof S]

// keys that are required in INPUT (not optional and no dep)
type RequiredInputKeysOf<S extends AnySchema> = S extends EmptySchema
  ? never
  : Exclude<keyof S, OptionalInputKeysOf<S>>

// type attrs to be provided by the test
// any attrs that are marked as 'optional' will be optional
// any attrs that may be resolved from context are also optional
type InputOf<S extends AnySchema> = S extends EmptySchema
  ? EmptySchema
  : Prettify<
      { [K in RequiredInputKeysOf<S>]: ValueOf<S, K> } & {
        [K in OptionalInputKeysOf<S>]?: ValueOf<S, K>
      }
    >

// type of attrs that will be provided to the factory fn
type OutputOf<S extends AnySchema> = S extends EmptySchema
  ? EmptySchema
  : { [K in keyof S]: ValueOf<S, K> }

type VoidableInputOf<Schema extends AnySchema> =
  RequiredInputKeysOf<Schema> extends never
    ? InputOf<Schema> | void
    : InputOf<Schema>

// get all required keys of an object
type RequiredKeys<T> = {
  // biome-ignore lint/complexity/noBannedTypes: allow the use of {} here
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// make a type voidable if it doesn't have any required keys
type MaybeVoid<T> = RequiredKeys<T> extends never ? T | void : T

type InferFixtureValue<T> = T extends () => VitestFixtureFn<
  infer _Deps,
  infer Value
>
  ? Value
  : never

// If you want to work with the Schema type directly
type SetSchemaFieldsOptional<
  Schema extends AnySchema,
  Keys extends keyof Schema,
> = {
  [K in keyof Schema]: K extends Keys
    ? Field<
        FixturesOf<Schema, K>,
        ValueOf<Schema, K>,
        'optional' // Force the flag to optional for these keys
      >
    : Schema[K]
}

export type {
  AnyField,
  AnySchema,
  AnySchemaBuilderWithContext,
  AnySchemaWithContext,
  DestroyFn,
  EmptySchema,
  FactoryFn,
  FixtureFn,
  FactoryOptions,
  Field,
  FieldOf,
  FlagOf,
  InferFixtureValue,
  InputOf,
  MaybeVoid,
  MissingField,
  OptionalInputKeysOf,
  OptionalOutputKeysOf,
  OutputOf,
  Prettify,
  RequiredFlag,
  RequiredInputKeysOf,
  RequiredOutputKeysOf,
  SchemaOf,
  SetSchemaFieldsOptional,
  ValueOf,
  VitestFixtureFn,
  VoidableInputOf,
}
