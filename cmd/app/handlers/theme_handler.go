package handlers

import (
	themeapi "github.com/cyrnicolase/dev-tools/internal/theme/interfaces"
)

// ThemeHandler 主题工具处理器
type ThemeHandler struct {
	api *themeapi.API
}

// NewThemeHandler 创建新的 ThemeHandler 实例
func NewThemeHandler() *ThemeHandler {
	return &ThemeHandler{
		api: themeapi.NewAPI(),
	}
}

// GetTheme 获取当前主题
func (h *ThemeHandler) GetTheme() string {
	return h.api.GetTheme()
}

// SetTheme 设置主题并保存
func (h *ThemeHandler) SetTheme(theme string) error {
	return h.api.SetTheme(theme)
}

// LoadTheme 加载主题配置
func (h *ThemeHandler) LoadTheme() error {
	return h.api.LoadTheme()
}

