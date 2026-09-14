package services

import (
	"errors"
	"testing"
	"time"

	"short-url/models"
)

func TestLinkWindowError(t *testing.T) {
	now := time.Date(2026, time.September, 14, 7, 30, 0, 0, time.UTC)
	future := now.Add(time.Minute)
	past := now.Add(-time.Minute)

	tests := []struct {
		name string
		link models.Link
		want error
	}{
		{name: "permanent", link: models.Link{}, want: nil},
		{name: "before activation", link: models.Link{StartAt: &future}, want: ErrLinkNotActive},
		{name: "at activation", link: models.Link{StartAt: &now}, want: nil},
		{name: "before expiration", link: models.Link{EndAt: &future}, want: nil},
		{name: "at expiration", link: models.Link{EndAt: &now}, want: ErrLinkExpired},
		{name: "after expiration", link: models.Link{EndAt: &past}, want: ErrLinkExpired},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := linkWindowError(&tt.link, now); !errors.Is(got, tt.want) {
				t.Fatalf("linkWindowError() = %v, want %v", got, tt.want)
			}
		})
	}
}
