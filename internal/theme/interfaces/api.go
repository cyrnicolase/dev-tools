package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/theme/application"
)

// API 主题工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// GetTheme 获取当前主题
func (a *API) GetTheme() string {
	return a.service.GetTheme()
}

// SetTheme 设置主题并保存
func (a *API) SetTheme(theme string) error {
	return a.service.SetTheme(theme)
}

// LoadTheme 加载主题配置
func (a *API) LoadTheme() error {
	return a.service.LoadTheme()
}
