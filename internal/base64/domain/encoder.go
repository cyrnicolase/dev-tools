package domain

import "encoding/base64"

// Encoder 提供 Base64 编码功能
type Encoder struct{}

// NewEncoder 创建新的 Encoder 实例
func NewEncoder() *Encoder {
	return &Encoder{}
}

// Encode 将字符串编码为 Base64
func (e *Encoder) Encode(input string) string {
	return base64.StdEncoding.EncodeToString([]byte(input))
}

// EncodeURLSafe 将字符串编码为 URL 安全的 Base64
func (e *Encoder) EncodeURLSafe(input string) string {
	return base64.URLEncoding.EncodeToString([]byte(input))
}
