import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { DatabaseConfig } from '@adonisjs/lucid/types/database'
import type { Database } from '@adonisjs/lucid/database'

import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class ListTables extends BaseCommand {
  static commandName = 'list:tables'
  static description = 'List all tables in the database'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string()
  declare name: string

  async run() {
    const db: Database = await this.app.container.make('lucid.db')
    const config = this.app.config.get<DatabaseConfig>('database')

    if (!this.name) {
      if (Object.keys(config.connections).length === 1) {
        this.name = config.connection
      } else {
        this.name = await this.prompt.choice(
          'Select package manager',
          Object.keys(config.connections)
        )
      }
    }

    try {
      const connection = db.connection(this.name)
      const client = connection.getReadClient()

      let tables: any[] = []

      // Get database client type
      const clientType = client.client.config.client

      if (['pg', 'postgres', 'postgresql'].includes(clientType)) {
        tables = await db
          .connection(this.name)
          .query()
          .select('table_name')
          .from('information_schema.tables')
          .where('table_schema', 'public')
          .orderBy('table_name')
      } else if (['mysql', 'mysql2'].includes(clientType)) {
        tables = await db
          .connection(this.name)
          .query()
          .select('TABLE_NAME as table_name')
          .from('information_schema.tables')
          .whereRaw('table_schema = DATABASE()')
          .orderBy('TABLE_NAME')
      } else if (['sqlite', 'sqlite3', 'better-sqlite3'].includes(clientType)) {
        tables = await db
          .connection(this.name)
          .query()
          .select('name as table_name')
          .from('sqlite_master')
          .where('type', 'table')
          .orderBy('name')
      } else if (['mssql'].includes(clientType)) {
        tables = await db
          .connection(this.name)
          .query()
          .select('name as table_name')
          .from('sys.tables')
          .orderBy('name')
      }

      if (tables.length > 0) {
        const formsTable = this.ui.table().head([`Tables in database (${clientType})`])
        tables.forEach((table: any) => {
          formsTable.row([table.table_name])
        })
        formsTable.render()
      } else {
        this.logger.info('No tables found in the database')
      }
    } catch (error) {
      this.logger.error(`Error listing tables: ${error.message}`)
    }
  }
}
