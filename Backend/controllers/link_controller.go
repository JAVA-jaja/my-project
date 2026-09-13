package controllers

import (
	"errors"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"short-url/services"

	"github.com/gin-gonic/gin"
)

type LinkController struct {
	service *services.LinkService
}

func NewLinkController(service *services.LinkService) *LinkController {
	return &LinkController{service: service}
}

type createLinkRequest struct {
	URL string `json:"url" binding:"required"`
	StartDate string `json:"startDate"`
	EndDate string `json:"endDate"`
}

func parseDate(value string) (*time.Time, error) {
	if value == "" { return nil, nil }
	date, err := time.Parse("2006-01-02", value)
	if err != nil { return nil, err }
	return &date, nil
}

func validateDestinationURL(value string) error {
	parsed, err := url.ParseRequestURI(value)
	if err != nil {
		return err
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return errors.New("only http and https URLs are allowed")
	}
	if parsed.Host == "" {
		return errors.New("URL host is required")
	}
	return nil
}

func (ctl *LinkController) Create(c *gin.Context) {
	var request createLinkRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}

	request.URL = strings.TrimSpace(request.URL)
	if len(request.URL) > 4096 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is too long"})
		return
	}
	if err := validateDestinationURL(request.URL); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid destination URL"})
		return
	}

	startDate, startErr := parseDate(request.StartDate)
	endDate, endErr := parseDate(request.EndDate)
	if startErr != nil || endErr != nil || (startDate != nil && endDate != nil && endDate.Before(*startDate)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date range"})
		return
	}

	link, err := ctl.service.Create(c.Request.Context(), request.URL, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create short link"})
		return
	}

	baseURL := strings.TrimRight(os.Getenv("BASE_URL"), "/")
	if baseURL == "" {
		baseURL = "http://" + c.Request.Host
	}
	c.JSON(http.StatusCreated, gin.H{
		"id":             link.ID,
		"shortCode":      link.ShortCode,
		"shortUrl":       baseURL + "/" + link.ShortCode,
		"destinationUrl": link.DestinationURL,
		"clickCount":     link.ClickCount,
		"createdAt":      link.CreatedAt,
		"startDate":      request.StartDate,
		"endDate":        request.EndDate,
	})
}

func (ctl *LinkController) Get(c *gin.Context) {
	link, err := ctl.service.FindByCode(c.Request.Context(), c.Param("code"))
	if errors.Is(err, services.ErrLinkNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "short link not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, link)
}

func (ctl *LinkController) Redirect(c *gin.Context) {
	destinationURL, err := ctl.service.ResolveAndIncrement(c.Request.Context(), c.Param("code"))
	if errors.Is(err, services.ErrLinkInactive) {
		c.JSON(http.StatusGone, gin.H{"error": "short link is not active"})
		return
	}
	if errors.Is(err, services.ErrLinkNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "short link not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.Redirect(http.StatusFound, destinationURL)
}
