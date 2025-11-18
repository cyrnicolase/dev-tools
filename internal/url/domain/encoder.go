package domain

import "net/url"

// Encoder 提供 URL 编码功能
type Encoder struct{}

// NewEncoder 创建新的 Encoder 实例
func NewEncoder() *Encoder {
	return &Encoder{}
}

// Encode 将字符串编码为 URL 编码格式
func (e *Encoder) Encode(input string) string {
	return url.QueryEscape(input)
}

