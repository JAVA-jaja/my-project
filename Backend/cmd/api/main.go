package main

import (
	"log"
	"os"

	"short-url/config"
	"short-url/controllers"
	"short-url/routes"
	"short-url/services"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatal(err)
	}

	linkService := services.NewLinkService(db)
	linkController := controllers.NewLinkController(linkService)
	router := routes.Setup(linkController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
