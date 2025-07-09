import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { DatabaseConfig } from '@adonisjs/lucid/types/database'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import DatabaseService from '../../src/services/database_service.js'

export default class DbCreate extends BaseCommand {
  static commandName = 'db:create'
  static description = 'Create a new database'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string()
  declare name: string

  async run() {
    const config = this.app.config.get<DatabaseConfig>('database')
    const connectionConfig = config.connections[this.name]

    if (!config) {
      this.logger.error('Database config not found')
      return
    }

    if (!this.name) {
      this.name = config.connection
    }

    if (!connectionConfig) {
      this.logger.error(`Database config for ${this.name} not found`)
      return
    }

    const databaseService = await DatabaseService.execute(connectionConfig)

    try {
      await databaseService.connect()
      const databaseName = typeof connectionConfig.connection === 'string'
      ? connectionConfig.connection
      : (connectionConfig.connection as any)?.database || (connectionConfig.connection as any)?.filename

      // Check if database exists
      const result = await databaseService.checkDatabaseExists(databaseName)

      if (result) {
        this.logger.info(`Database ${databaseName} already exists`)
        return
      }

      // Create database
      await databaseService.createDatabase(databaseName)
      this.logger.success(`Database ${databaseName} created successfully`)
    } catch (error) {
      this.logger.error(`Failed to create database: ${error.message}`)
    } finally {
      await databaseService.disconnect()
    }
  }
}
