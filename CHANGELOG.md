# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Upgrading from v1? See **[MIGRATION.md](./MIGRATION.md)**.

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
