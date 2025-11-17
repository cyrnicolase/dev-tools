package handlers

import (
	"github.com/cyrnicolase/dev-tools/internal/base64/interfaces"
)

// Base64Handler Base64 工具处理器
type Base64Handler struct {
	api *interfaces.API
}

// NewBase64Handler 创建新的 Base64Handler 实例
func NewBase64Handler() *Base64Handler {
	return &Base64Handler{
		api: interfaces.NewAPI(),
	}
}

// Encode 编码为 Base64
func (h *Base64Handler) Encode(input string) string {
	return h.api.Encode(input)
}

// EncodeURLSafe 编码为 URL 安全的 Base64
func (h *Base64Handler) EncodeURLSafe(input string) string {
	return h.api.EncodeURLSafe(input)
}

// Decode 解码 Base64
func (h *Base64Handler) Decode(input string) (string, error) {
	return h.api.Decode(input)
}

// DecodeURLSafe 解码 URL 安全的 Base64
func (h *Base64Handler) DecodeURLSafe(input string) (string, error) {
	return h.api.DecodeURLSafe(input)
}

// Validate 验证 Base64
func (h *Base64Handler) Validate(input string) bool {
	return h.api.Validate(input)
}

// ValidateURLSafe 验证 URL 安全的 Base64
func (h *Base64Handler) ValidateURLSafe(input string) bool {
	return h.api.ValidateURLSafe(input)
}
