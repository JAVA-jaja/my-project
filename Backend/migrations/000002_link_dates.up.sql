ALTER TABLE links ADD COLUMN start_date DATE, ADD COLUMN end_date DATE;
ALTER TABLE links ADD CONSTRAINT valid_link_dates CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
