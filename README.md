# @jrmc/adonis-lucid-commands

Additional commands for AdonisJS 6 Lucid ORM to help with database management and exploration.

## Features

This package provides additional Ace commands for AdonisJS applications to manage and explore databases:

### Database Management Commands

- **`db:create`** - Create a new database
- **`db:drop`** - Drop an existing database (with production safety)
- **`db:query`** - Execute a raw SQL query on the database

### Database Exploration Commands

- **`list:databases`** - List all configured database connections
- **`list:tables`** - List all tables in a specific database

## Installation

```bash
npm install @jrmc/adonis-lucid-commands
```

## Configuration

After installation, configure the package in your AdonisJS application:

```bash
node ace configure @jrmc/adonis-lucid-commands
```

This will automatically register the commands in your `adonisrc.ts` file.

## Usage

### Database Management

#### Create a Database

```bash
# Create database using default connection
node ace db:create

# Create database using specific connection
node ace db:create --name=mysql
```

#### Drop a Database

```bash
# Drop database using default connection
node ace db:drop

# Drop database using specific connection
node ace db:drop --name=mysql
```

**⚠️ Safety Note:** The `db:drop` command is disabled in production environments to prevent accidental data loss.

#### Query a Database

```bash
# Execute a SQL query
node ace db:query 'SELECT * FROM users'

# Execute a query on a specific connection
node ace db:query 'SELECT * FROM users' --name=mysql
```

##### Output Formats

The command supports multiple output formats:

**Table format (default)** - Results displayed in a formatted table with truncated long values:

```bash
node ace db:query 'SELECT * FROM users'
```

**JSON format** - Results displayed as formatted JSON (ideal for complex data or piping):

```bash
node ace db:query 'SELECT * FROM users' --json
```

**Vertical format** - Each row displayed as a block with one column per line (like MySQL `\G`):

```bash
node ace db:query 'SELECT * FROM users' --vertical
```

### Database Exploration

#### List Database Connections

```bash
node ace list:databases
```

This command displays all configured database connections with their client type and database name.

#### List Tables

```bash
# List tables in default connection
node ace list:tables

# List tables in specific connection
node ace list:tables --name=mysql
```

This command shows all tables in the specified database connection. It supports multiple database clients:

- **PostgreSQL** - Uses `information_schema.tables`
- **MySQL** - Uses `information_schema.tables`
- **SQLite** - Uses `sqlite_master`
- **MSSQL** - Uses `sys.tables`

## Supported Database Clients

The package supports the following database clients:

- PostgreSQL (`pg`, `postgres`, `postgresql`)
- MySQL (`mysql`, `mysql2`)
- SQLite (`sqlite`, `sqlite3`, `better-sqlite3`)
- Microsoft SQL Server (`mssql`)

## Requirements

- AdonisJS Core: `^6.12.1`
- AdonisJS Lucid: `^20.6.0 || ^21.0.0`


## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Jeremy Chaufourier - [jeremy@chaufourier.fr](mailto:jeremy@chaufourier.fr)

## Repository

[https://github.com/batosai/adonis-lucid-commands](https://github.com/batosai/adonis-lucid-commands)
