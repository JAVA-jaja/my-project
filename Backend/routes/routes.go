package routes

import (
	"net/http"
	"os"
	"strings"

	"short-url/controllers"

	"github.com/gin-gonic/gin"
)

func Setup(linkController *controllers.LinkController) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery(), corsMiddleware())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api")
	{
		api.POST("/links", linkController.Create)
		api.GET("/links/:code", linkController.Get)
	}

	router.GET("/:code", linkController.Redirect)
	return router
}

func corsMiddleware() gin.HandlerFunc {
	configuredOrigins := os.Getenv("FRONTEND_ORIGIN")
	if configuredOrigins == "" {
		configuredOrigins = "*"
	}

	allowedOrigins := make(map[string]struct{})
	for _, origin := range strings.Split(configuredOrigins, ",") {
		origin = strings.TrimSpace(origin)
		if origin != "" {
			allowedOrigins[origin] = struct{}{}
		}
	}
	_, allowAllOrigins := allowedOrigins["*"]

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		_, originIsAllowed := allowedOrigins[origin]
		if origin != "" && !allowAllOrigins && !originIsAllowed {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "origin is not allowed"})
			return
		}
		if origin != "" {
			if allowAllOrigins {
				c.Header("Access-Control-Allow-Origin", "*")
			} else {
				c.Header("Access-Control-Allow-Origin", origin)
			}
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
