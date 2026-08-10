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

func TestConverter_TimestampToTimeString_WithSecondTimestamp(t *testing.T) {
	converter := NewConverter()
	timestamp := int64(1723293026)

	result, err := converter.TimestampToTimeString(timestamp, "DateTime", "UTC")
	if err != nil {
		t.Fatalf("TimestampToTimeString() error = %v", err)
	}

	expected := time.Unix(timestamp, 0).UTC().Format("2006-01-02 15:04:05")
	if result != expected {
		t.Errorf("TimestampToTimeString() = %q, want %q", result, expected)
	}
}

func TestConverter_TimestampToTimeStringMilli_WithMilliTimestamp(t *testing.T) {
	converter := NewConverter()
	timestampMilli := int64(1723293026123)

	result, err := converter.TimestampToTimeStringMilli(timestampMilli, "DateTime", "UTC")
	if err != nil {
		t.Fatalf("TimestampToTimeStringMilli() error = %v", err)
	}

	expectedTime := time.Unix(timestampMilli/1000, (timestampMilli%1000)*int64(time.Millisecond)).UTC()
	expected := expectedTime.Format("2006-01-02 15:04:05.000")
	if result != expected {
		t.Errorf("TimestampToTimeStringMilli() = %q, want %q", result, expected)
	}
}
