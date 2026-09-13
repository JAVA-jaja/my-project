ALTER TABLE links DROP CONSTRAINT valid_link_dates;
ALTER TABLE links DROP COLUMN start_date, DROP COLUMN end_date;
