package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSMiddlewareAllowsConfiguredFrontend(t *testing.T) {
	t.Setenv("FRONTEND_ORIGIN", "https://frontend.example")
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/api/links", nil)
	request.Header.Set("Origin", "https://frontend.example")

	Setup(nil).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusNoContent)
	}
	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "https://frontend.example" {
		t.Fatalf("Access-Control-Allow-Origin = %q", got)
	}
}

func TestCORSMiddlewareRejectsOtherOrigins(t *testing.T) {
	t.Setenv("FRONTEND_ORIGIN", "https://frontend.example")
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/api/links", nil)
	request.Header.Set("Origin", "https://evil.example")

	Setup(nil).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusForbidden)
	}
}
