import type { SqliteConfig, LibSQLConfig } from '@adonisjs/lucid/types/database'

import knex, { Knex } from 'knex'
import { existsSync, unlinkSync } from 'node:fs'

export default class SqliteService {
  #config: SqliteConfig | LibSQLConfig
  #knex: Knex | null

  constructor(config: SqliteConfig | LibSQLConfig) {
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
          filename: this.#config.connection.filename,
        },
        useNullAsDefault: true,
      })
    }
  }

  async disconnect() {
    if (this.#knex) {
      await this.#knex.destroy()
      this.#knex = null
    }
  }

  async createDatabase(_databaseName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    await this.#knex.raw(
      "SELECT 1"
    )
  }

  async dropDatabase(_databaseName: string) {
    if (this.#knex) {
      await this.#knex.destroy()
      this.#knex = null
    }

    if (existsSync(this.#config.connection.filename)) {
      unlinkSync(this.#config.connection.filename)
    }
  }

  async checkDatabaseExists(_databaseName: string) {
    return existsSync(this.#config.connection.filename)
  }

  async checkTableExists(_databaseName: string, tableName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    const result = await this.#knex.raw(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      [tableName]
    )
    return result.rowCount > 0
  }
}
