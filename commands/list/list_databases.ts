import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { DatabaseConfig } from '@adonisjs/lucid/types/database'

import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class ListDatabases extends BaseCommand {
  static commandName = 'list:databases'
  static description = 'List all tables in the database'
  static aliases = ['list:db', 'list:dbs']

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Database connection name' })
  declare name: string

  async run() {
    const config = this.app.config.get<DatabaseConfig>('database')

    if (!config) {
      this.logger.error('Database config not found')
      return
    }

    const formsTable = this.ui.table().head(['Connection', 'Client', 'Name'])

    Object.keys(config.connections).forEach((key: string) => {
      const connection = config.connections[key].connection
      const databaseName =
        typeof connection === 'string'
          ? connection
          : (connection as any)?.database || (connection as any)?.filename
      formsTable.row([key, config.connections[key].client, databaseName])
    })

    formsTable.render()
  }
}
