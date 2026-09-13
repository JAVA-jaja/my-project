ALTER TABLE links
    ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;

UPDATE links
SET start_at = start_date::timestamp AT TIME ZONE 'UTC',
    end_at = (end_date + 1)::timestamp AT TIME ZONE 'UTC'
WHERE start_at IS NULL AND end_at IS NULL
  AND start_date IS NOT NULL AND end_date IS NOT NULL;

ALTER TABLE links DROP CONSTRAINT IF EXISTS valid_link_window;
ALTER TABLE links ADD CONSTRAINT valid_link_window
    CHECK (start_at IS NULL OR end_at IS NULL OR end_at > start_at);
