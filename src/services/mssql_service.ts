import type { MssqlConfig } from '@adonisjs/lucid/types/database'

import knex, { Knex } from 'knex'

export default class MssqlService {
  #config: MssqlConfig
  #knex: Knex | null

  constructor(config: MssqlConfig) {
    if (!config.connection || typeof config.connection === 'string') {
      throw new Error('Invalid database config provided')
    }

    this.#config = config
    this.#knex = null
  }

  async connect() {
    if (!this.#config.connection || typeof this.#config.connection === 'string') {
      throw new Error('Invalid database config provided')
    }

    if (!this.#knex) {
      this.#knex = knex({
        client: this.#config.client,
        connection: {
          server: this.#config.connection.server,
          port: this.#config.connection.port,
          user: this.#config.connection.user,
          password: this.#config.connection.password,
          database: 'master',
        },
      })
    }
  }

  async disconnect() {
    if (this.#knex) {
      await this.#knex.destroy()
      this.#knex = null
    }
  }

  async createDatabase(databaseName: string) {
    if (!this.#knex) throw new Error('Not connected to database')
    await this.#knex.raw(`CREATE DATABASE ${databaseName}`)
  }

  async dropDatabase(databaseName: string) {
    if (!this.#knex) throw new Error('Not connected to database')
    await this.#knex.raw(`DROP DATABASE ${databaseName}`)
  }

  async checkDatabaseExists(databaseName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    try {
      const result = await this.#knex.raw(
        `SELECT COUNT(*) as count FROM sys.databases WHERE name = '${databaseName}'`
      )
      console.log('MSSQL checkDatabaseExists result:', result)
      return result && result[0] && result[0][0] && result[0][0].count > 0
    } catch (error) {
      console.error('Error checking database exists:', error)
      return false
    }
  }

  async checkTableExists(databaseName: string, tableName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    const result = await this.#knex.raw(
      'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = ? AND TABLE_NAME = ?',
      [databaseName, tableName]
    )
    console.log('MSSQL checkTableExists result:', result)
    return result && result.length > 0 && result[0] && result[0].length > 0
  }
}
