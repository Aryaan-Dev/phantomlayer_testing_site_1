import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client'

faker.seed(44)

export async function generateDecoyRecords(db: PrismaClient) {
  // Decoy users — internal-looking roles
  const decoyUsers = await Promise.all(
    [
      { username: 'ops.admin', role: 'admin', passwordHint: 'P@ssw0rd!2023' },
      { username: 'daniel.chen', role: 'ops', passwordHint: 'meridian_ops_2024' },
      { username: 'sarah.kumar', role: 'support', passwordHint: 'Support#789' },
      { username: 'backup.svc', role: 'ops', passwordHint: 'svc_backup_xK92' },
      { username: 'root', role: 'admin', passwordHint: 'rootroot' },
    ].map((u) =>
      db.decoyUser.upsert({
        where: { id: u.username },
        update: {},
        create: {
          id: u.username,
          username: u.username,
          passwordHint: u.passwordHint,
          role: u.role,
        },
      })
    )
  )

  // Decoy backup records — realistic-looking backup file names
  const backupNames = [
    'customers_export_2024-08-01.sql.gz',
    'transactions_full_2024-09-01.sql.gz',
    'meridianbank_db_prod_backup_2024-09-15.tar.gz',
    'accounts_snapshot_20240922.bak',
    'full_db_backup_2024-09-20.sql.gz',
  ]
  const decoyBackups = await Promise.all(
    backupNames.map((fileName) =>
      db.decoyBackupRecord.create({
        data: {
          fileName,
          sizeBytes: faker.number.int({ min: 50_000_000, max: 2_000_000_000 }),
          createdAt: faker.date.recent({ days: 30 }),
        },
      })
    )
  )

  return { decoyUsers, decoyBackups }
}
