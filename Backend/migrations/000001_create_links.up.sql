CREATE TABLE IF NOT EXISTS links (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(16) NOT NULL UNIQUE,
    destination_url TEXT NOT NULL,
    click_count BIGINT NOT NULL DEFAULT 0 CHECK (click_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
