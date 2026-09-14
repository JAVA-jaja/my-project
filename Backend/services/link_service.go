package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"short-url/models"
	"short-url/utils"

	"gorm.io/gorm"
)

var (
	ErrLinkNotFound   = errors.New("link not found")
	ErrCodeGeneration = errors.New("cannot generate unique short code")
	ErrLinkNotActive  = errors.New("link is not active yet")
	ErrLinkExpired    = errors.New("link has expired")
)

type LinkService struct {
	db *gorm.DB
}

func NewLinkService(db *gorm.DB) *LinkService {
	return &LinkService{db: db}
}

func (s *LinkService) Create(ctx context.Context, destinationURL string, startAt, endAt *time.Time) (*models.Link, error) {
	const maximumAttempts = 5

	for attempt := 0; attempt < maximumAttempts; attempt++ {
		code, err := utils.GenerateShortCode(8)
		if err != nil {
			return nil, err
		}

		link := models.Link{ShortCode: code, DestinationURL: destinationURL, StartAt: startAt, EndAt: endAt}
		result := s.db.WithContext(ctx).Create(&link)
		if result.Error == nil {
			return &link, nil
		}
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			continue
		}

		return nil, fmt.Errorf("create link: %w", result.Error)
	}

	return nil, ErrCodeGeneration
}

func (s *LinkService) FindByCode(ctx context.Context, code string) (*models.Link, error) {
	var link models.Link
	result := s.db.WithContext(ctx).Where("short_code = ?", code).First(&link)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, ErrLinkNotFound
	}
	if result.Error != nil {
		return nil, fmt.Errorf("find link: %w", result.Error)
	}

	return &link, nil
}

func (s *LinkService) GetStats(ctx context.Context, code string) (*models.Link, error) {
	return s.FindByCode(ctx, code)
}

func linkWindowError(link *models.Link, now time.Time) error {
	if link.StartAt != nil && now.Before(*link.StartAt) {
		return ErrLinkNotActive
	}
	if link.EndAt != nil && !now.Before(*link.EndAt) {
		return ErrLinkExpired
	}
	return nil
}

func (s *LinkService) ResolveAndIncrement(ctx context.Context, code string) (string, error) {
	now := time.Now().UTC()
	var result struct {
		DestinationURL string `gorm:"column:destination_url"`
	}

	tx := s.db.WithContext(ctx).Raw(`
		UPDATE links
		SET click_count = click_count + 1,
		    updated_at = NOW()
		WHERE short_code = ?
		  AND (start_at IS NULL OR start_at <= ?)
		  AND (end_at IS NULL OR end_at > ?)
		RETURNING destination_url
	`, code, now, now).Scan(&result)
	if tx.Error != nil {
		return "", fmt.Errorf("resolve link: %w", tx.Error)
	}
	if tx.RowsAffected == 0 {
		if link, err := s.FindByCode(ctx, code); err == nil {
			return "", linkWindowError(link, now)
		} else if !errors.Is(err, ErrLinkNotFound) {
			return "", err
		}
		return "", ErrLinkNotFound
	}

	return result.DestinationURL, nil
}
