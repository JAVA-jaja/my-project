package services

import (
	"context"
	"errors"
	"fmt"

	"short-url/models"
	"short-url/utils"

	"gorm.io/gorm"
)

var (
	ErrLinkNotFound   = errors.New("link not found")
	ErrCodeGeneration = errors.New("cannot generate unique short code")
)

type LinkService struct {
	db *gorm.DB
}

func NewLinkService(db *gorm.DB) *LinkService {
	return &LinkService{db: db}
}

func (s *LinkService) Create(ctx context.Context, destinationURL string) (*models.Link, error) {
	const maximumAttempts = 5

	for attempt := 0; attempt < maximumAttempts; attempt++ {
		code, err := utils.GenerateShortCode(8)
		if err != nil {
			return nil, err
		}

		link := models.Link{ShortCode: code, DestinationURL: destinationURL}
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

func (s *LinkService) ResolveAndIncrement(ctx context.Context, code string) (string, error) {
	var result struct {
		DestinationURL string `gorm:"column:destination_url"`
	}

	tx := s.db.WithContext(ctx).Raw(`
		UPDATE links
		SET click_count = click_count + 1,
		    updated_at = NOW()
		WHERE short_code = ?
		RETURNING destination_url
	`, code).Scan(&result)
	if tx.Error != nil {
		return "", fmt.Errorf("resolve link: %w", tx.Error)
	}
	if tx.RowsAffected == 0 {
		return "", ErrLinkNotFound
	}

	return result.DestinationURL, nil
}
