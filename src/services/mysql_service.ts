import type { MysqlConfig } from '@adonisjs/lucid/types/database'

import knex, { Knex } from 'knex'

export default class MysqlService {
  #config: MysqlConfig
  #knex: Knex | null

  constructor(config: MysqlConfig) {
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
          database: 'mysql',
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
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [databaseName]
    )
    return result[0].length > 0
  }

  async checkTableExists(databaseName: string, tableName: string) {
    if (!this.#knex) throw new Error('Not connected to database')

    const result = await this.#knex.raw(
      'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
      [databaseName, tableName]
    )
    return result[0].length > 0
  }
}
