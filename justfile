# Make locally installed Node binaries available to every recipe, matching the
# environment used by package.json scripts.
root_bin := justfile_directory() / "node_modules/.bin"
export PATH := root_bin + ":./node_modules/.bin:" + env("PATH")

# Load a local .env file when present.
set dotenv-load

# List available commands.
default: help

help:
    @just --list

# Install dependencies from the lockfile.
install:
    pnpm install --prefer-offline --frozen-lockfile

# Build distributable JavaScript and declaration files.
build:
    tsdown

# Run the test suite. Additional Vitest arguments can be forwarded, e.g.
# `just test src/field.test.ts`.
test *args:
    vitest --watch=false {{ args }}

# Apply Biome's safe and unsafe automatic fixes.
fix:
    biome check --fix --unsafe

# Check formatting and lint rules without changing files.
lint:
    biome check

# Type-check the entire project.
check:
    tsc --incremental

# Find unused files, dependencies, and exports.
knip *args:
    knip {{ args }}

# Run all read-only quality checks.
qa: lint check test knip build

# Remove generated build and incremental TypeScript output.
clean:
    rm -rf dist tsconfig.tsbuildinfo
