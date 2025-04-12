# Let's Go Lean Database Setup Scripts

This directory contains the modular database setup scripts for the Let's Go Lean application. The scripts have been separated into logically grouped components to improve reliability and ease of troubleshooting.

## Script Organization

1. `01-types.sql` - Creates custom PostgreSQL enum types
2. `02-tables.sql` - Creates database tables
3. `03-rls.sql` - Sets up Row Level Security policies
4. `04-functions.sql` - Defines database functions
5. `05-indexes.sql` - Creates indexes for performance optimization
6. `00-run-all.sql` - Main script that runs all components in sequence

## Execution Instructions

### Option 1: Manual Step-by-Step Execution (Recommended for First Setup)

This approach allows you to check for errors at each step:

1. Connect to the Supabase SQL Editor or PostgreSQL client
2. Run each script individually in this order:
   ```
   01-types.sql
   02-tables.sql
   03-rls.sql
   04-functions.sql
   05-indexes.sql
   ```
3. Check for errors after each step before proceeding to the next

### Option 2: Using the Main Script

For subsequent runs when you're confident in the setup:

1. Connect to the Supabase SQL Editor or PostgreSQL client
2. Navigate to the `db-setup` directory
3. Run `00-run-all.sql`

```sql
\i 'db-setup/00-run-all.sql'
```

## Troubleshooting Common Issues

### Type Already Exists

If you encounter "type already exists" errors:

1. The type creation script uses conditional logic to avoid this error
2. If it still occurs, you may need to drop the affected type first:
   ```sql
   DROP TYPE IF EXISTS type_name CASCADE;
   ```
   Note: Use CASCADE with caution as it will drop dependent objects

### Function Not Unique

If you see "function is not unique" errors:

1. The function drop statements are designed to specify the full parameter signature
2. If errors persist, check if there are multiple versions of the function with different parameter types
3. You can list all versions of a function with:
   ```sql
   SELECT proname, proargtypes, prosrc FROM pg_proc WHERE proname = 'function_name';
   ```

### Policy Already Exists

If you encounter policy errors:

1. The scripts include exception handling for undefined_object errors
2. If issues persist, verify that all tables exist before applying policies
3. You can manually drop a problematic policy:
   ```sql
   DROP POLICY IF EXISTS "Policy Name" ON table_name;
   ```

## Database Reset

If you need to completely reset the database (development environments only):

```sql
-- WARNING: This will delete all data!
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
  
  FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
    EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
  END LOOP;
END $$;
```

## Notes for Production Use

1. Create a backup before running any scripts
2. Test all changes in a staging environment first
3. Consider using migration tools for structured database changes
4. Monitor for potential performance issues after schema updates 