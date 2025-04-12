-- Let's Go Lean Database Setup
-- This script controls the execution order of all the database setup components

-- IMPORTANT: Run each component separately and check for errors between executions
-- If an error occurs, fix it before proceeding to the next component

-- Step 1: Create custom enum types
\echo 'Creating custom enum types...'
\i 'db-setup/01-types.sql'

-- Step 2: Create database tables
\echo 'Creating database tables...'
\i 'db-setup/02-tables.sql'

-- Step 3: Apply RLS policies
\echo 'Setting up Row Level Security policies...'
\i 'db-setup/03-rls.sql'

-- Step 4: Create functions
\echo 'Creating database functions...'
\i 'db-setup/04-functions.sql'

-- Step 5: Create indexes
\echo 'Creating database indexes...'
\i 'db-setup/05-indexes.sql'

\echo 'Database setup complete!' 