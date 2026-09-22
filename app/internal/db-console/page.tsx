import { decoyDb } from '@/lib/db/decoy'
import { emitPhantomLayerEvent } from '@/lib/events/emitPhantomLayerEvent'
import { Table, TableHead, TableBody, Th, Td, Tr } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { cookies } from 'next/headers'

// DECOY PAGE — Fake DB/Ops Console (looks like an internal Adminer-style tool)
// ISOLATION: Only imports lib/db/decoy — never lib/db/real

const sidebarTables = [
  { name: 'decoy_users', label: 'users' },
  { name: 'decoy_backups', label: 'backup_records' },
  { name: 'decoy_customers_export', label: 'customers_export' },
]

// Fake static rows for the "customers_export" table
const fakeCustomerExportRows = [
  { id: 'CUS_001', name: 'Margaret Holloway', ssn: '***-**-4821', email: 'mholloway@example.com', balance: '$48,291.00' },
  { id: 'CUS_002', name: 'Dennis Park', ssn: '***-**-7734', email: 'dennispark@example.net', balance: '$12,048.50' },
  { id: 'CUS_003', name: 'Priya Nair', ssn: '***-**-3390', email: 'pnair@testmail.org', balance: '$221,500.00' },
]

export default async function DbConsolePage({
  searchParams,
}: {
  searchParams: { table?: string }
}) {
  const activeTable = searchParams.table ?? 'decoy_users'

  // Emit PhantomLayer event for this page load
  const cookieStore = cookies()
  const sessionId = cookieStore.get('decoy-session')?.value ?? crypto.randomUUID()

  await emitPhantomLayerEvent({
    path: '/internal/db-console',
    method: 'GET',
    decoyType: 'db_console',
    sessionId,
    metadata: { activeTable, note: 'Decoy DB console accessed' },
  })

  let rows: Record<string, unknown>[] = []
  let columns: string[] = []

  if (activeTable === 'decoy_users') {
    const data = await decoyDb.decoyUser.findMany({ orderBy: { createdAt: 'desc' } })
    rows = data as unknown as Record<string, unknown>[]
    columns = ['id', 'username', 'role', 'passwordHint', 'createdAt']
  } else if (activeTable === 'decoy_backups') {
    const data = await decoyDb.decoyBackupRecord.findMany({ orderBy: { createdAt: 'desc' } })
    rows = data as unknown as Record<string, unknown>[]
    columns = ['id', 'fileName', 'sizeBytes', 'createdAt']
  } else if (activeTable === 'decoy_customers_export') {
    rows = fakeCustomerExportRows as unknown as Record<string, unknown>[]
    columns = ['id', 'name', 'ssn', 'email', 'balance']
  }

  return (
    <div className="min-h-screen flex bg-neutral-100 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-primary-900 flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider font-medium">MeridianBank</p>
          <p className="text-sm text-white font-semibold mt-0.5">DB Operations Console</p>
        </div>
        <nav className="p-2">
          <p className="text-xs text-white/40 uppercase tracking-wider px-2 py-1 mb-1">Tables</p>
          {sidebarTables.map((t) => (
            <a
              key={t.name}
              href={`/internal/db-console?table=${t.name}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeTable === t.name
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="font-mono text-xs opacity-60">#</span>
              {t.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main panel */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-neutral-900">
              {sidebarTables.find((t) => t.name === activeTable)?.label ?? activeTable}
            </h1>
            <p className="text-xs text-neutral-500">{rows.length} rows — read-only view</p>
          </div>
          <Badge variant="warning">Internal Use Only</Badge>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHead>
              <tr>
                {columns.map((col) => <Th key={col}>{col}</Th>)}
              </tr>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <Tr key={i}>
                  {columns.map((col) => (
                    <Td key={col} className="font-mono text-xs">
                      {col === 'role' ? (
                        <Badge variant={row[col] === 'admin' ? 'admin' : row[col] === 'ops' ? 'ops' : 'support'}>
                          {String(row[col])}
                        </Badge>
                      ) : col === 'sizeBytes' ? (
                        formatBytes(row[col] as number)
                      ) : col === 'createdAt' && row[col] instanceof Date ? (
                        (row[col] as Date).toISOString().slice(0, 19)
                      ) : (
                        String(row[col] ?? '')
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${bytes} B`
}
