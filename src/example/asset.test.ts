import { test as anyTest } from 'vitest'

import type { Database, Request, Workspace } from './asset.js'

import { assetFactory } from './asset.js'

const test = anyTest.extend({
  db: { rows: [] } as Database,
  request: undefined as Request | undefined,
  workspace: { id: 'workspace-from-context' } as Workspace,
  asset: assetFactory.useValue(),
  createAsset: assetFactory.useCreateValue(),
})

test('useValue creates a context-backed fixture and cleans it up', ({
  asset,
  db,
  expect,
}) => {
  expect(asset).toMatchObject({
    workspaceId: 'workspace-from-context',
    title: 'Test asset',
  })
  expect(db.rows).toStrictEqual([asset])
})

test('useCreateValue accepts per-call attributes', async ({
  createAsset,
  db,
  expect,
}) => {
  const asset = await createAsset({ title: 'Created asset' })

  expect(asset).toMatchObject({
    workspaceId: 'workspace-from-context',
    title: 'Created asset',
  })
  expect(db.rows).toStrictEqual([asset])
})

test('maybeFrom uses context sources in declaration order', async ({
  expect,
}) => {
  const db: Database = { rows: [] }

  {
    await using asset = await assetFactory.build(undefined, {
      db,
      request: { workspaceId: 'workspace-from-request' },
      workspace: { id: 'workspace-fallback' },
    })

    expect(asset.value.workspaceId).toBe('workspace-from-request')
    expect(db.rows).toStrictEqual([asset.value])
  }

  expect(db.rows).toStrictEqual([])
})
