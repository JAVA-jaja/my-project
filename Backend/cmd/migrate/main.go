package main

import (
	"context"
	"log"

	"short-url/config"
	"short-url/migrations"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatal(err)
	}
	if err := migrations.Up(context.Background(), db); err != nil {
		log.Fatal(err)
	}
	log.Println("database migrations are up to date")
}
