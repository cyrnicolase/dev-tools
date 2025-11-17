package domain

import (
	"encoding/base64"
	"testing"
)

func TestEncoder_Encode(t *testing.T) {
	encoder := NewEncoder()

	input := "Hello, World!"
	expected := base64.StdEncoding.EncodeToString([]byte(input))
	result := encoder.Encode(input)

	if result != expected {
		t.Errorf("Encode() = %v, want %v", result, expected)
	}
}

func TestEncoder_EncodeURLSafe(t *testing.T) {
	encoder := NewEncoder()

	input := "Hello, World!"
	expected := base64.URLEncoding.EncodeToString([]byte(input))
	result := encoder.EncodeURLSafe(input)

	if result != expected {
		t.Errorf("EncodeURLSafe() = %v, want %v", result, expected)
	}
}
