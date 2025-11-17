package domain

import (
	"testing"
	"time"
)

func TestConverter_TimestampToTime(t *testing.T) {
	converter := NewConverter()

	timestamp := int64(1609459200) // 2021-01-01 00:00:00 UTC
	result := converter.TimestampToTime(timestamp)

	expected := time.Unix(timestamp, 0)
	if !result.Equal(expected) {
		t.Errorf("TimestampToTime() = %v, want %v", result, expected)
	}
}

func TestConverter_TimeToTimestamp(t *testing.T) {
	converter := NewConverter()

	now := time.Now()
	result := converter.TimeToTimestamp(now)
	expected := now.Unix()

	if result != expected {
		t.Errorf("TimeToTimestamp() = %v, want %v", result, expected)
	}
}
