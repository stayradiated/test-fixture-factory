import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  target: 'node22',
  dts: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
})
