package routes

import (
	"net/http"

	"short-url/controllers"

	"github.com/gin-gonic/gin"
)

func Setup(linkController *controllers.LinkController) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

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
