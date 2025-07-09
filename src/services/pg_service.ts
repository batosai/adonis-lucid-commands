import type { PostgreConfig } from '@adonisjs/lucid/types/database'

import knex, { Knex } from 'knex'

export default class PgService {
  #config: PostgreConfig
  #knex: Knex | null

  constructor(config: PostgreConfig) {
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
          ...this.#config.connection,
          database: 'postgres',
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

    const result = await this.#knex.raw(
      'SELECT 1 FROM pg_database WHERE datname = ?',
      [databaseName]
    )
    return result.rowCount > 0
  }

  async checkTableExists(databaseName: string, tableName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    const result = await this.#knex.raw(
      `SELECT 1 FROM ${databaseName}.${tableName} LIMIT 1`
    )
    return result.rowCount > 0
  }
}
