package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/url/application"
)

// API URL 工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Encode 编码为 URL 编码格式
func (a *API) Encode(input string) string {
	return a.service.Encode(input)
}

// Decode 解码 URL 编码的字符串
func (a *API) Decode(input string) (string, error) {
	return a.service.Decode(input)
}

