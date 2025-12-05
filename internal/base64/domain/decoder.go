package domain

import (
	"encoding/base64"

	"github.com/pkg/errors"
)

// Decoder 提供 Base64 解码功能
type Decoder struct{}

// NewDecoder 创建新的 Decoder 实例
func NewDecoder() *Decoder {
	return &Decoder{}
}

// Decode 将 Base64 字符串解码
func (d *Decoder) Decode(input string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		return "", errors.Wrapf(err, "failed to decode base64")
	}
	return string(decoded), nil
}

// DecodeURLSafe 将 URL 安全的 Base64 字符串解码
func (d *Decoder) DecodeURLSafe(input string) (string, error) {
	decoded, err := base64.URLEncoding.DecodeString(input)
	if err != nil {
		return "", errors.Wrapf(err, "failed to decode URL-safe base64")
	}
	return string(decoded), nil
}
