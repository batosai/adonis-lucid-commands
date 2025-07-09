import type { ConnectionConfig } from '@adonisjs/lucid/types/database'

import PgService from './pg_service.js'
import MysqlService from './mysql_service.js'
import SqliteService from './sqlite_service.js'
import MssqlService from './mssql_service.js'

export default class DatabaseService {
  static async execute(config?: ConnectionConfig) {
    if (!config) {
      throw new Error('No database config provided')
    }

    switch (config.client) {
      case 'pg':
      case 'postgres':
      case 'postgresql':
        return new PgService(config)
      case 'mysql':
      case 'mysql2':
        return new MysqlService(config)
      case 'sqlite':
      case 'sqlite3':
      case 'better-sqlite3':
        return new SqliteService(config)
      case 'mssql':
        return new MssqlService(config)
      default:
        throw new Error(`Database ${config.client} not supported`)
    }
  }
}
