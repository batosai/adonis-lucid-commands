import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { DatabaseConfig } from '@adonisjs/lucid/types/database'
import type { Database } from '@adonisjs/lucid/database'

import { BaseCommand, flags, args } from '@adonisjs/core/ace'

export default class DbQuery extends BaseCommand {
  static commandName = 'db:query'
  static description = 'Query the database'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Database connection name' })
  declare name: string

  @flags.boolean({ description: 'Output result as JSON', default: false })
  declare json: boolean

  @flags.boolean({ description: 'Output result in vertical format (one column per line)', default: false })
  declare vertical: boolean

  @args.string({ description: 'SQL query to execute' })
  declare query: string

  async run() {
    const db: Database = await this.app.container.make('lucid.db')
    const config = this.app.config.get<DatabaseConfig>('database')

    if (!this.name) {
      if (Object.keys(config.connections).length === 1) {
        this.name = config.connection
      } else {
        this.name = await this.prompt.choice(
          'Select database connection',
          Object.keys(config.connections)
        )
      }
    }

    try {
      const result = await db.connection(this.name).rawQuery(this.query)

      // Extract rows from the result (format varies by database driver)
      const rows = this.extractRows(result)

      if (rows.length === 0) {
        this.logger.info('Query executed successfully. No rows returned.')
        return
      }

      // Output based on selected format
      if (this.json) {
        this.renderJson(rows)
      } else if (this.vertical) {
        this.renderVertical(rows)
      } else {
        this.renderTable(rows)
      }

      this.logger.info(`${rows.length} row(s) returned`)
    } catch (error) {
      this.logger.error(`Error querying database: ${error.message}`)
    }
  }

  /**
   * Render results as a table
   */
  private renderTable(rows: any[]): void {
    const columns = Object.keys(rows[0])
    const table = this.ui.table().head(columns)

    rows.forEach((row: Record<string, any>) => {
      const values = columns.map((col) => this.formatValue(row[col], 50))
      table.row(values)
    })

    table.render()
  }

  /**
   * Render results as JSON
   */
  private renderJson(rows: any[]): void {
    this.logger.log(JSON.stringify(rows, null, 2))
  }

  /**
   * Render results in vertical format (one column per line, like MySQL \G)
   */
  private renderVertical(rows: any[]): void {
    const columns = Object.keys(rows[0])
    const maxColLength = Math.max(...columns.map((c) => c.length))

    rows.forEach((row: Record<string, any>, index: number) => {
      this.logger.log(this.colors.cyan(`*************************** ${index + 1}. row ***************************`))
      columns.forEach((col) => {
        const paddedCol = col.padStart(maxColLength)
        const value = this.formatValue(row[col])
        this.logger.log(`${this.colors.yellow(paddedCol)}: ${value}`)
      })
    })
  }

  /**
   * Extract rows from raw query result (format varies by database driver)
   */
  private extractRows(result: any): any[] {
    // PostgreSQL returns { rows: [...] }
    if (result.rows && Array.isArray(result.rows)) {
      return result.rows
    }

    // MySQL returns [rows, fields] or rows directly
    if (Array.isArray(result)) {
      // MySQL2 returns [rows, fields]
      if (result.length === 2 && Array.isArray(result[0])) {
        return result[0]
      }
      return result
    }

    return []
  }

  /**
   * Format a value for display
   */
  private formatValue(value: any, maxLength?: number): string {
    let result: string

    if (value === null) {
      result = 'NULL'
    } else if (value === undefined) {
      result = ''
    } else if (value instanceof Date) {
      result = value.toISOString()
    } else if (typeof value === 'object') {
      result = JSON.stringify(value)
    } else {
      result = String(value)
    }

    // Truncate if maxLength is specified and value is too long
    if (maxLength && result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + '...'
    }

    return result
  }
}
