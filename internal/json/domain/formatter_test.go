package domain

import "testing"

func TestFormatter_Format(t *testing.T) {
	formatter := NewFormatter()

	tests := []struct {
		name    string
		input   string
		wantErr bool
	}{
		{
			name:    "valid json",
			input:   `{"name":"test","age":30}`,
			wantErr: false,
		},
		{
			name:    "invalid json",
			input:   `{"name":"test","age":30`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := formatter.Format(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("Format() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestFormatter_Minify(t *testing.T) {
	formatter := NewFormatter()

	input := `{
		"name": "test",
		"age": 30
	}`

	result, err := formatter.Minify(input)
	if err != nil {
		t.Fatalf("Minify() error = %v", err)
	}

	if len(result) >= len(input) {
		t.Errorf("Minify() result should be shorter than input")
	}
}
