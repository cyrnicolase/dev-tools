package app

import (
	"github.com/cyrnicolase/dev-tools/cmd/app/handlers"
)

// ThemeManager 主题管理器
// 负责主题的加载、设置和管理
type ThemeManager struct {
	handler *handlers.ThemeHandler
}

// NewThemeManager 创建新的主题管理器
func NewThemeManager() *ThemeManager {
	return &ThemeManager{
		handler: handlers.NewThemeHandler(),
	}
}

// LoadThemeForStartup 在启动时加载主题设置（用于设置窗口背景色）
// 这个方法在窗口创建之前调用，确保窗口背景色与主题一致
// 如果加载失败，使用默认主题，不影响应用启动
func (tm *ThemeManager) LoadThemeForStartup() {
	if err := tm.handler.LoadTheme(); err != nil {
		panic(err)
	}
}

// GetTheme 获取当前主题
func (tm *ThemeManager) GetTheme() string {
	return tm.handler.GetTheme()
}

// SetTheme 设置主题并持久化保存
func (tm *ThemeManager) SetTheme(theme string) error {
	return tm.handler.SetTheme(theme)
}

// GetHandler 获取主题处理器（供 Wails Bind 使用）
func (tm *ThemeManager) GetHandler() *handlers.ThemeHandler {
	return tm.handler
}
