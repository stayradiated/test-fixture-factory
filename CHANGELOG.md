# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Upgrading from v1? See **[MIGRATION.md](./MIGRATION.md)**.

## [2.1.0] - 2025-10-01

### 🚀 Added

- **New `.fixture()` method** - Replaces `.withValue()` with a more intuitive API that aligns with Vitest's fixture pattern
  - Accepts `(attrs, use)` callback where `use()` is called with the fixture value
  - Teardown code runs after `await use()` resolves, just like Vitest fixtures
  - Cleaner separation between setup and teardown logic

### ✨ Improved

- **Generic type parameter** - `createFactory<Value>(name)` now accepts an optional type parameter for better type inference
- **Explicit resource management** - `.build()` now returns an object with `Symbol.asyncDispose`, enabling `await using` pattern (TypeScript 5.2+)
- **Better lifecycle control** - Fixtures now use `Promise.withResolvers()` for more robust coordination between test execution and cleanup

### 📝 Documentation

- Updated README with comprehensive `.fixture()` examples and migration guide from `.withValue()`
- Added teardown examples showing cleanup patterns
- Clarified attribute resolution order

### 🔧 Deprecated

- `.withValue()` is now deprecated in favor of `.fixture()` but remains functional for backwards compatibility

## [2.0.0] - 2025-09-03

### 🚀 Highlights

- Complete rewrite with a **fluent, schema-first API**
- Strong, readable **TypeScript inference** end-to-end
- Explicit, typed **context reads** with `.from(...)` / `.maybeFrom(...)`
- Automatic **UndefinedFieldError** for factory names and missing-field details
- Sensible **fixture lifecycle** (auto-destroy by default, overridable)

### 🔥 Breaking Changes

- **Entry point**: `defineFactory` **removed** → use `createFactory(name)` with `.withSchema()` and `.withValue()`.
- **Field API**:
  - **Added**: `.from(...)` (required context reads; transform or no-transform overloads)
  - **Added**: `.maybeFrom(...)` (optional context reads returning `T | undefined`)
  - **Changed**: `.default(value | () => value)` is pure (no context argument)
  - **Removed**: `.dependsOn(...)`, `.optionalDefault(...)`
- **Fixture helpers**: `useValueFn` → **`useValue`**, `useCreateFn` → **`useCreateValue`**.
- **Build signature**: `defineFactory(...)(context, attrs)` → **`createFactory(...).build(attrs?, context?)`**.

## [1.x.x] - Previous Versions

v1 used `defineFactory`, passed dependencies into the factory function, and exposed `useValueFn` / `useCreateFn`. See git history for details.
