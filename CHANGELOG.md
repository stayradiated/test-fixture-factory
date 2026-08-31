# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Upgrading from v1? See **[MIGRATION.md](./MIGRATION.md)**.

## [Unreleased]

## [2.3.0] - 2026-08-31

### Added

- `Factory`, a public type for annotating configured factories without exposing
  internal builder types.
- `BuiltFixture`, a public type for annotating disposable `.build()` results.
- `FactoryFixtureFn`, a public type for callbacks passed to `.fixture()`.
- `UseCreateValueFactory`, a public type for exporting the generic
  `factory.useCreateValue` method while preserving call-time preset inference.

### Fixed

- Chained `.maybeFrom(...)` calls now try context sources in declaration order,
  allowing later calls to act as fallbacks.
- TypeScript now rejects chained `.from(...)` calls, which cannot provide a
  required context value with a fallback.

## [2.2.0] - 2026-08-30

### 🚀 Added

- Public fixture declaration types (`UseValueFixture`, `UseCreateValueFixture`,
  `CreateValueFn`, `CreateValueInput`, and `PresetInput`) for compact
  downstream declaration emits.

## [2.1.0] - 2025-10-01

### Added

- New `.fixture()` method, replacing `.withValue()` with a Vitest-style `(attrs, use)` callback.
- Optional `Value` type parameter for `createFactory<Value>(name)`.
- `Symbol.asyncDispose` support on values returned by `.build()`, enabling `await using`.

### Changed

- Fixture lifecycle coordination now uses `Promise.withResolvers()`.

### Fixed

- Fixtures no longer hang when automatic cleanup is disabled.

### Documentation

- Added `.fixture()` migration, setup/teardown, and attribute-resolution examples.

### Deprecated

- `.withValue()` is deprecated in favor of `.fixture()` and remains available for backwards compatibility.

## [2.0.3] - 2025-09-19

### Changed

- Lowered the Node.js engine requirement from 24 to 22 and updated project dependencies.

## [2.0.2] - 2025-09-03

### Fixed

- Factories with an empty schema can now be created and built correctly.

## [2.0.1] - 2025-09-03

### Added

- Optional fields in factory schemas.

## [2.0.0] - 2025-09-03

### Highlights

- Complete rewrite with a **fluent, schema-first API**.
- Strong, readable TypeScript inference end-to-end.
- Explicit, typed context reads with `.from(...)` and `.maybeFrom(...)`.
- Automatic `UndefinedFieldError` messages with factory names and missing-field details.
- Fixture lifecycle management with automatic destruction by default.

### Breaking Changes

- `defineFactory` was removed; use `createFactory(name)` with `.withSchema()` and `.withValue()`.
- Field API changes:
  - Added `.from(...)` for required context reads and `.maybeFrom(...)` for optional reads.
  - `.default(value | () => value)` no longer receives context.
  - Removed `.dependsOn(...)` and `.optionalDefault(...)`.
- Renamed fixture helpers: `useValueFn` to `useValue`, and `useCreateFn` to `useCreateValue`.
- Changed factory builds from `defineFactory(...)(context, attrs)` to `createFactory(...).build(attrs?, context?)`.

## [2.0.0-7] - 2025-09-02

### Changed

- Renamed `.withFn()` to `.withValue()`.

## [2.0.0-6] - 2025-09-02

### Improved

- Improved errors produced while creating factories.

## [2.0.0-5] - 2025-09-02

### Changed

- Simplified default-value handling in schema factories.

## [2.0.0-4] - 2025-09-02

### Changed

- Replaced `defineFactory` and the field-builder implementation with the `createFactory` and field APIs that underpin v2.

## [2.0.0-3] - 2025-09-02

### Changed

- Improved type definitions and fixture handling; updated linting configuration.

## [2.0.0-2] - 2025-09-01

### Changed

- Refined schema default-value resolution and TypeScript types.

## [2.0.0-1] - 2025-09-01

### Added

- Field-builder default values.

## [2.0.0-0] - 2025-09-01

### Added

- Default attributes when creating factories.
- The initial v2 field-builder and schema-resolution APIs.

## [1.7.0] - 2025-08-29

### Changed

- Updated Biome and project dependencies.

## [1.6.1] - 2024-12-31

### Added

- Re-exported all public types from the package entry point.

## [1.6.0] - 2024-12-31

### Added

- `InferFixtureValue` type for inferring fixture values.
- Yes/no environment-variable parsing utility.

## [1.5.0] - 2024-12-31

### Added

- `TFF_SKIP_DESTROY` environment variable to disable automatic fixture destruction.
- Documentation for resource-cleanup controls.

## [1.4.0] - 2024-12-19

### Added

- Example tests and type-definition improvements.

## [1.3.0] - 2024-12-06

### Changed

- Simplified test setup and improved type consistency.

## [1.2.0] - 2024-12-02

### Documentation

- Expanded README usage examples and formatting.

## [1.1.0] - 2024-11-30

### Changed

- Updated build scripts and added type generation.

## [1.0.0] - 2024-11-30

### Added

- Initial release of `test-fixture-factory`.
