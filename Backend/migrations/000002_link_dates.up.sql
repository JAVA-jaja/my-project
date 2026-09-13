ALTER TABLE links ADD COLUMN IF NOT EXISTS start_date DATE, ADD COLUMN IF NOT EXISTS end_date DATE;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_link_dates' AND conrelid = 'links'::regclass) THEN
        ALTER TABLE links ADD CONSTRAINT valid_link_dates
            CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
    END IF;
END $$;
