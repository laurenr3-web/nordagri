
# Supabase Migrations

This directory contains SQL migration files for the Supabase database.

## Naming Convention

Migration files follow this naming pattern: `YYYYMMDD_HHMMSS_description.sql`

For example:
- `20230601_120000_initial_schema.sql`
- `20230602_093000_add_wear_column.sql`

## Migration History

A migration_history table tracks which migrations have been applied.

## Running Migrations

To apply migrations:

```bash
npm run db:migrate
```

## Migration Guidelines

1. Always make backward-compatible changes when possible
2. Test migrations locally before applying to production
3. Include both "up" and "down" migrations when applicable
4. Document complex migrations with comments
