package controllers

import (
	"testing"
	"time"
)

func TestParseActiveWindow(t *testing.T) {
	start := "2026-09-14T07:30:00Z"
	end := "2026-09-14T08:30:00Z"

	gotStart, gotEnd, err := parseActiveWindow(start, end)
	if err != nil {
		t.Fatalf("parseActiveWindow() error = %v", err)
	}
	if gotStart == nil || gotEnd == nil || !gotStart.Equal(time.Date(2026, 9, 14, 7, 30, 0, 0, time.UTC)) {
		t.Fatalf("unexpected parsed window: %v %v", gotStart, gotEnd)
	}

	invalid := [][2]string{{start, ""}, {"", end}, {end, start}, {"bad", end}}
	for _, values := range invalid {
		if _, _, err := parseActiveWindow(values[0], values[1]); err == nil {
			t.Fatalf("parseActiveWindow(%q, %q) expected error", values[0], values[1])
		}
	}
}
