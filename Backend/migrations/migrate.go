package migrations

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"sort"
	"strings"

	"gorm.io/gorm"
)

//go:embed *.up.sql
var files embed.FS

// Up applies pending migrations in filename order. Each file and its version
// record are committed together, so a failed migration can be retried safely.
func Up(ctx context.Context, db *gorm.DB) error {
	if err := db.WithContext(ctx).Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version TEXT PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`).Error; err != nil {
		return fmt.Errorf("create migration history: %w", err)
	}

	entries, err := fs.ReadDir(files, ".")
	if err != nil {
		return fmt.Errorf("list migrations: %w", err)
	}
	var names []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".up.sql") {
			names = append(names, entry.Name())
		}
	}
	sort.Strings(names)

	for _, name := range names {
		version := strings.TrimSuffix(name, ".up.sql")
		var count int64
		if err := db.WithContext(ctx).Table("schema_migrations").Where("version = ?", version).Count(&count).Error; err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if count > 0 {
			continue
		}
		sql, err := files.ReadFile(name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}
		if err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			if err := tx.Exec(string(sql)).Error; err != nil {
				return err
			}
			return tx.Exec("INSERT INTO schema_migrations (version) VALUES (?)", version).Error
		}); err != nil {
			return fmt.Errorf("apply migration %s: %w", name, err)
		}
	}
	return nil
}
