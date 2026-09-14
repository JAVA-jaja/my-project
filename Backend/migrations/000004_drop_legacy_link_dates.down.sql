ALTER TABLE links ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS end_date DATE;

UPDATE links
SET start_date = start_at::date,
    end_date = (end_at - INTERVAL '1 day')::date
WHERE start_at IS NOT NULL AND end_at IS NOT NULL;

ALTER TABLE links DROP CONSTRAINT IF EXISTS valid_link_dates;
ALTER TABLE links ADD CONSTRAINT valid_link_dates
    CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
