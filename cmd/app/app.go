package app

import (
	"context"
)

// Version 应用版本号
// 可以通过构建时注入: go build -ldflags "-X github.com/cyrnicolase/dev-tools/cmd/app.Version=1.4.1"
var Version = "1.4.1"

// GetVersion 获取应用版本号（包级别函数）
func GetVersion() string {
	return Version
}

// App 应用聚合根
// 负责聚合各个管理器，提供统一的访问接口
type App struct {
	// 工具管理器
	ToolManager *ToolManager

	// 处理器注册表
	Handlers *HandlerRegistry

	// 主题管理器
	Theme *ThemeManager
}

// NewApp 创建新的 App 实例
func NewApp() *App {
	return &App{
		ToolManager: NewToolManager(),
		Handlers:    NewHandlerRegistry(),
		Theme:       NewThemeManager(),
	}
}

// LoadThemeForStartup 在启动时加载主题设置（用于设置窗口背景色）
// 这个方法在窗口创建之前调用，确保窗口背景色与主题一致
// 如果加载失败，使用默认主题，不影响应用启动
func (a *App) LoadThemeForStartup() {
	a.Theme.LoadThemeForStartup()
}

// Startup 应用启动时的回调
func (a *App) Startup(ctx context.Context) {
	// 设置工具管理器的上下文（用于事件发送）
	a.ToolManager.SetContext(ctx)
	// 设置HashHandler的上下文（用于文件对话框）
	a.Handlers.Hash.SetContext(ctx)
	// 设置JSONHandler的上下文（用于文件对话框）
	a.Handlers.JSON.SetContext(ctx)
}

// GetVersion 获取应用版本号（实例方法）
func (a *App) GetVersion() string {
	return GetVersion()
}

// SetInitialTool 设置启动时的工具名称
func (a *App) SetInitialTool(toolName string) {
	a.ToolManager.SetInitialTool(toolName)
}

// GetInitialTool 获取启动时指定的工具名称
func (a *App) GetInitialTool() string {
	return a.ToolManager.GetInitialTool()
}

// ClearInitialTool 清除初始工具设置（用于防止重复切换）
func (a *App) ClearInitialTool() {
	a.ToolManager.ClearInitialTool()
}

// NavigateToTool 导航到指定工具（供前端调用）
func (a *App) NavigateToTool(toolName string) bool {
	return a.ToolManager.NavigateToTool(toolName)
}

// ShowHelp 显示使用说明（供菜单栏调用）
func (a *App) ShowHelp() {
	a.ToolManager.ShowHelp()
}

// GetTheme 获取当前主题
func (a *App) GetTheme() string {
	return a.Theme.GetTheme()
}

// SetTheme 设置主题并持久化保存
func (a *App) SetTheme(theme string) error {
	return a.Theme.SetTheme(theme)
}

// NextTool 切换到下一个工具（循环）
func (a *App) NextTool() {
	a.ToolManager.NextTool()
}

// PreviousTool 切换到上一个工具（循环）
func (a *App) PreviousTool() {
	a.ToolManager.PreviousTool()
}

// GetCurrentTool 获取当前工具ID
func (a *App) GetCurrentTool() string {
	return a.ToolManager.GetCurrentTool()
}

// SetCurrentTool 设置当前工具（供前端同步状态，不发送事件）
func (a *App) SetCurrentTool(toolID string) {
	a.ToolManager.SetCurrentTool(toolID)
}
