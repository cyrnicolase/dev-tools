package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/base64/application"
)

// API Base64 工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Encode 编码为 Base64
func (a *API) Encode(input string) string {
	return a.service.Encode(input)
}

// EncodeURLSafe 编码为 URL 安全的 Base64
func (a *API) EncodeURLSafe(input string) string {
	return a.service.EncodeURLSafe(input)
}

// Decode 解码 Base64
func (a *API) Decode(input string) (string, error) {
	return a.service.Decode(input)
}

// DecodeURLSafe 解码 URL 安全的 Base64
func (a *API) DecodeURLSafe(input string) (string, error) {
	return a.service.DecodeURLSafe(input)
}

// Validate 验证 Base64
func (a *API) Validate(input string) bool {
	return a.service.Validate(input)
}

// ValidateURLSafe 验证 URL 安全的 Base64
func (a *API) ValidateURLSafe(input string) bool {
	return a.service.ValidateURLSafe(input)
}
