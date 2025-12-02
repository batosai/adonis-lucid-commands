import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { DatabaseConfig } from '@adonisjs/lucid/types/database'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import DatabaseService from '../../src/services/database_service.js'

export default class DbDrop extends BaseCommand {
  static commandName = 'db:drop'
  static description = 'Drop the database'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Database connection name' })
  declare name: string

  async run() {
    // Prevent database drop in production
    if (this.app.inProduction) {
      this.logger.error('Cannot drop database in production environment')
      return
    }

    const config = this.app.config.get<DatabaseConfig>('database')

    if (!config) {
      this.logger.error('Database config not found')
      return
    }

    if (!this.name) {
      this.name = config.connection
    }

    const connectionConfig = config.connections[this.name]

    if (!connectionConfig) {
      this.logger.error(`Database config for ${this.name} not found`)
      return
    }

    const databaseService = await DatabaseService.execute(connectionConfig)

    try {
      await databaseService.connect()
      const databaseName =
        typeof connectionConfig.connection === 'string'
          ? connectionConfig.connection
          : (connectionConfig.connection as any)?.database ||
            (connectionConfig.connection as any)?.filename

      // Check if database exists
      const result = await databaseService.checkDatabaseExists(databaseName)

      if (!result) {
        this.logger.info(`Database ${databaseName} does not exist`)
        return
      }

      const deleteFiles = await this.prompt.confirm(`Want to delete ${databaseName} files?`)

      if (deleteFiles) {
        await databaseService.dropDatabase(databaseName)
        this.logger.success(`Database ${databaseName} dropped successfully`)
      }
    } catch (error) {
      this.logger.error(`Failed to drop database: ${error.message}`)
    } finally {
      await databaseService.disconnect()
    }
  }
}
