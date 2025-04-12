# PostgreSQL/Supabase Database Guidelines

This document outlines important guidelines when working with PostgreSQL in Supabase for the Let's Go Lean application.

## Key PostgreSQL Compatibility Issues

1. **Type Creation**: PostgreSQL doesn't support `CREATE TYPE IF NOT EXISTS` for enum types
2. **Policy Management**: Policies with the same name on the same table can't be created twice
3. **Function Dropping**: Functions must be dropped with their full signature
4. **Table Dependency**: Policies can only be dropped if their tables exist
5. **Function Security**: SECURITY DEFINER functions need explicit search_path settings
6. **Function Uniqueness**: Functions are identified by name and parameter types, not just name

## Type Creation

PostgreSQL does not support `CREATE TYPE IF NOT EXISTS` syntax. When creating custom types, use a PL/pgSQL DO block:

```sql
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'my_type_name') THEN
    CREATE TYPE my_type_name AS ENUM ('value1', 'value2');
  END IF;
END $$;
```

## Policy Management

### Dropping Policies Safely

When working with RLS policies, follow these guidelines:

1. **Always check if the table exists before dropping policies**:
```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'my_table') THEN
    BEGIN
      DROP POLICY IF EXISTS "Policy Name" ON my_table;
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END;
  END IF;
END $$;
```

2. **Handle exceptions for undefined objects**:
```sql
BEGIN
  DROP POLICY IF EXISTS "Policy Name" ON table_name;
EXCEPTION
  WHEN undefined_object THEN NULL;
END;
```

### Order of Operations

The correct order for database setup:
1. Create enum types
2. Create tables
3. Enable RLS on tables
4. Drop existing policies (with table existence checks)
5. Create new policies
6. Create functions and indexes

### Policy Creation Strategy

For a robust setup script:

1. **Group policy drops by table**:
   ```sql
   DO $$
   BEGIN
     -- Table 1 policies
     IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'table_1') THEN
       BEGIN
         DROP POLICY IF EXISTS "Policy 1" ON table_1;
       EXCEPTION
         WHEN undefined_object THEN NULL;
       END;
       
       BEGIN
         DROP POLICY IF EXISTS "Policy 2" ON table_1;
       EXCEPTION
         WHEN undefined_object THEN NULL;
       END;
     END IF;
     
     -- Table 2 policies
     -- ...
   END $$;
   ```

2. **Use descriptive policy names** - This helps with maintenance and debugging
3. **Document each policy's purpose** - Add comments explaining what each policy does
4. **Follow consistent naming conventions** - Such as "Users can X their own Y"

## Function Management

### Handling Function Uniqueness

PostgreSQL identifies functions by their name AND parameter types, not just by name. This means:

1. **Always drop functions before recreating them**, specifying the exact parameter types:
   ```sql
   DO $$
   BEGIN
     DROP FUNCTION IF EXISTS public.my_function(
       uuid, text, integer, timestamp, decimal, boolean
     );
   EXCEPTION
     WHEN undefined_function THEN NULL;
   END $$;
   ```

2. **When you encounter "function is not unique" errors**, it means:
   - You have multiple functions with the same name but different parameter types
   - You need to specify the full parameter signature when dropping the function
   - You may need to drop all versions of the function to avoid conflicts

3. **Best practice for function management**:
   - Always drop all functions at the beginning of your script
   - Include explicit parameter types in the DROP FUNCTION statements
   - Handle non-existent function exceptions
   - Group function drops together before function creation

### Function Security

All functions marked with `SECURITY DEFINER` must explicitly set the search path at the beginning of the function to prevent potential security vulnerabilities:

```sql
CREATE OR REPLACE FUNCTION public.my_secure_function(param1 type, param2 type)
RETURNS return_type AS $$
BEGIN
  -- Set search path explicitly for security
  SET search_path = public;
  
  -- Function logic here
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Why This Matters

Without an explicit search path:
- A malicious user could create schemas and objects that override system objects
- When the function executes with elevated privileges, it might use the wrong objects
- This can lead to privilege escalation attacks

### Example Functions That Need Search Path

In our application, all these functions need `SET search_path = public;`:
- `create_user_profile`
- `log_food` 
- `log_weight`
- `log_activity`
- `create_post`
- `interact_with_post`

### Checking for Mutable Search Path Issues

The Supabase linter warns about functions with mutable search paths:
```
function_search_path_mutable: Function has a role mutable search_path
```

Always address these warnings by setting the search path explicitly in all SECURITY DEFINER functions.

## Dropping Objects

When dropping database objects that might not exist, use exception handling:

```sql
DO $$
BEGIN
  DROP FUNCTION IF EXISTS my_function(param1_type, param2_type);
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;
```

## Row Level Security (RLS)

Always follow these steps for RLS:
1. Create tables
2. Enable RLS on tables
3. Create policies (with proper error handling)
4. Create helper functions with `SECURITY DEFINER`

## Function Parameters

When creating functions, match parameter types exactly with the table column types to avoid type casting issues.

## Table and Index Creation

Always use `IF NOT EXISTS` when creating tables and indexes:
- `CREATE TABLE IF NOT EXISTS table_name`
- `CREATE INDEX IF NOT EXISTS idx_name ON table_name`

## Enum Type Values

When using enum types in functions, it's safest to convert text to the enum type explicitly:
```sql
INSERT INTO table (enum_column) VALUES (input_value::enum_type);
```

## Handling Duplicate Types

If you encounter "type already exists" errors, the safest approach is to:
1. Drop and recreate the entire schema (if possible during development)
2. Use conditional type creation (as shown above)
3. Consider using the Supabase UI for critical type definitions 

## Incremental Deployment

For production deployments, separate your schema into multiple migration files:
1. Type definitions
2. Table definitions 
3. Function definitions
4. Index and policy definitions

This allows for easier troubleshooting and recovery if one part fails.

## Modular Database Setup Structure

We've implemented a modular database setup approach in the `db-setup` directory to improve maintainability and error isolation:

### Directory Structure
```
lets-go-lean/db-setup/
├── 00-run-all.sql       # Main script that runs all components in sequence
├── 01-types.sql         # Creates custom PostgreSQL enum types
├── 02-tables.sql        # Creates database tables
├── 03-rls.sql           # Sets up Row Level Security policies
├── 04-functions.sql     # Defines database functions
├── 05-indexes.sql       # Creates indexes for performance optimization
└── README.md            # Documentation for using the scripts
```

### Advantages of the Modular Approach

1. **Better Error Isolation**: If an error occurs, you know exactly which file is causing the issue
2. **Easier Maintenance**: Changes to one component don't affect others
3. **Sequential Execution Control**: You can run parts separately to check for errors at each step
4. **Improved Readability**: Each file is focused on a specific task
5. **Safer Database Updates**: Reduce the risk of partial schema updates that leave the database in an inconsistent state

### Usage Recommendations

#### For Initial Setup or Major Changes
Run each script individually in sequence:
```sql
\i 'db-setup/01-types.sql'
\i 'db-setup/02-tables.sql'
\i 'db-setup/03-rls.sql'
\i 'db-setup/04-functions.sql'
\i 'db-setup/05-indexes.sql'
```
Check for errors after each step before proceeding to the next.

#### For Routine Updates
Use the main script to run everything at once:
```sql
\i 'db-setup/00-run-all.sql'
```

#### In Development Environment
When developing locally, you can use the database reset script for a clean start:
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

-- Then run:
\i 'db-setup/00-run-all.sql'
```

### Making Schema Changes

1. Identify which component needs to be modified
2. Update the appropriate file in the `db-setup` directory
3. Test the changes individually by running just that file
4. Once verified, test the complete setup using the main script
5. Update the README.md with any relevant notes about the changes

### Troubleshooting

For common issues and their solutions, refer to the comprehensive troubleshooting guide in `db-setup/README.md`.

## Supabase Security Best Practices

### Authentication Settings

1. **Enable Leaked Password Protection**
   - In Supabase dashboard: Authentication → Providers → Email
   - Check "Enable" for "Protect against leaked passwords"
   - This prevents users from using compromised passwords by checking against HaveIBeenPwned.org

2. **Enable Multiple MFA Options**
   - In Supabase dashboard: Authentication → Multi-factor Authentication
   - Enable TOTP (Time-based One-Time Password) method at minimum
   - Consider enabling additional methods for better security

### Regular Database Security Audits

Run the Supabase database linter regularly to identify potential security issues:
- SQL Editor → Database Linter
- Address all warnings, especially those in the SECURITY category

## Common PostgreSQL/Supabase Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `type already exists` | Attempt to create a type that already exists | Use DO block with conditional creation |
| `relation does not exist` | Attempting operations on a non-existent table | Check table existence before operations |
| `function is not unique` | Multiple functions with same name but different parameters | Specify full parameter signature when dropping |
| `policy already exists` | Attempting to create a policy that exists | Drop policies with exception handling |
| `function already exists` | Recreating a function without dropping it | Use CREATE OR REPLACE or drop first |
| `mutable search_path` | SECURITY DEFINER function without explicit search path | Add SET search_path = public; |

## Error Recovery Strategies

When running into errors during schema setup:

1. **Identify error category**:
   - Type already exists → Use conditional creation
   - Policy already exists → Drop with exception handling
   - Function signature mismatch → Provide full signature when dropping
   - Table doesn't exist → Check table existence before dropping policies
   - Function security → Add explicit search_path setting
   - Function not unique → Specify exact parameter types when dropping

2. **Partial script execution**:
   If you encounter errors partway through execution, you may need to:
   - Comment out successful parts
   - Focus on executing only the failed parts
   - Re-run incrementally

3. **Schema Reset** (Development Only):
   - In development, consider dropping and recreating the entire schema
   - This is not recommended for production environments with data 