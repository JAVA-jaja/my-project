package models

import "time"

type Link struct {
	ID             uint64    `gorm:"primaryKey" json:"id"`
	ShortCode      string    `gorm:"type:varchar(16);uniqueIndex;not null" json:"shortCode"`
	DestinationURL string    `gorm:"type:text;not null" json:"destinationUrl"`
	ClickCount     uint64    `gorm:"not null;default:0" json:"clickCount"`
	StartDate      *time.Time `gorm:"type:date" json:"startDate"`
	EndDate        *time.Time `gorm:"type:date" json:"endDate"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
