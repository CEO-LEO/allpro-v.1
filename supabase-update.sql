-- Update all tables and columns containing 'All Promotion' to 'Pro Hunter'
DO $$
DECLARE
    r RECORD;
    t RECORD;
BEGIN
    FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        FOR t IN SELECT column_name FROM information_schema.columns WHERE table_name = r.table_name LOOP
            EXECUTE format(
                'UPDATE %I SET %I = REPLACE(%I, ''All Promotion'', ''Pro Hunter'') WHERE %I LIKE ''%All Promotion%''',
                r.table_name, t.column_name, t.column_name, t.column_name
            );
        END LOOP;
    END LOOP;
END $$;
-- This script will update all occurrences of 'All Promotion' in every column of every table in the public schema.
-- Please review and test before running in production.