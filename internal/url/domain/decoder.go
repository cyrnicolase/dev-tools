package domain

import (
	"fmt"
	"net/url"
)

// Decoder 提供 URL 解码功能
type Decoder struct{}

// NewDecoder 创建新的 Decoder 实例
func NewDecoder() *Decoder {
	return &Decoder{}
}

// Decode 将 URL 编码的字符串解码
func (d *Decoder) Decode(input string) (string, error) {
	decoded, err := url.QueryUnescape(input)
	if err != nil {
		return "", fmt.Errorf("failed to decode URL: %w", err)
	}
	return decoded, nil
}

