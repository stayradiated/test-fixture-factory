import { createFactory } from '../create-factory.js'

type Database = {
  rows: Array<{ id: string; workspaceId: string; title: string }>
}

type Workspace = { id: string }
type Request = { workspaceId: string }

const assetFactory = createFactory<{
  id: string
  workspaceId: string
  title: string
}>('Asset')
  .withContext<{
    db: Database
    request?: Request
    workspace?: Workspace
  }>()
  .withSchema((f) => ({
    db: f.type<Database>().from('db'),
    workspaceId: f
      .type<string>()
      .maybeFrom('request', ({ request }) => request?.workspaceId)
      .maybeFrom('workspace', ({ workspace }) => workspace?.id),
    title: f.type<string>().default('Test asset'),
  }))
  .fixture(async ({ db, workspaceId, title }, use) => {
    const asset = { id: `asset-${db.rows.length + 1}`, workspaceId, title }
    db.rows.push(asset)

    try {
      await use(asset)
    } finally {
      db.rows.splice(db.rows.indexOf(asset), 1)
    }
  })

export type { Database, Request, Workspace }

export { assetFactory }
