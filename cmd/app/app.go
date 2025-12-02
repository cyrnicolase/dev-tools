package app

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/cyrnicolase/dev-tools/cmd/app/handlers"
	"github.com/cyrnicolase/dev-tools/internal/logger"
)

// Version 应用版本号
// 可以通过构建时注入: go build -ldflags "-X github.com/cyrnicolase/dev-tools/cmd/app.Version=1.0.8"
var Version = "1.0.8"

// GetVersion 获取应用版本号（包级别函数）
func GetVersion() string {
	return Version
}

// App 应用主结构体，负责应用级别的功能
type App struct {
	// 工具处理器
	JSON      *handlers.JSONHandler
	Base64    *handlers.Base64Handler
	Timestamp *handlers.TimestampHandler
	UUID      *handlers.UUIDHandler
	URL       *handlers.URLHandler
	QRCode    *handlers.QRCodeHandler
	IPQuery   *handlers.IPQueryHandler

	// 工具导航
	initialTool string
	toolMu      sync.RWMutex

	// 主题管理器
	themeManager *ThemeManager
}

// NewApp 创建新的 App 实例
func NewApp() *App {
	return &App{
		JSON:         handlers.NewJSONHandler(),
		Base64:       handlers.NewBase64Handler(),
		Timestamp:    handlers.NewTimestampHandler(),
		UUID:         handlers.NewUUIDHandler(),
		URL:          handlers.NewURLHandler(),
		QRCode:       handlers.NewQRCodeHandler(),
		IPQuery:      handlers.NewIPQueryHandler(),
		themeManager: NewThemeManager(),
	}
}

// LoadThemeForStartup 在启动时加载主题设置（用于设置窗口背景色）
// 这个方法在窗口创建之前调用，确保窗口背景色与主题一致
func (a *App) LoadThemeForStartup() {
	a.themeManager.Load()
}

// Startup 应用启动时的回调
func (a *App) Startup(_ context.Context) {
	// 初始化日志记录器
	// 日志文件保存在用户目录下的 .dev-tools/logs 文件夹
	homeDir, err := os.UserHomeDir()
	if err != nil {
		// 如果获取用户目录失败，使用当前目录
		homeDir = "."
	}
	logDir := filepath.Join(homeDir, ".dev-tools", "logs")
	if err := logger.InitLogger(logDir); err != nil {
		// 日志初始化失败不影响应用运行，只输出到控制台
		println("警告: 日志初始化失败:", err.Error())
	}

	// 主题管理器在创建时已经加载了主题设置，这里不需要再次加载
}

// GetVersion 获取应用版本号（实例方法）
func (a *App) GetVersion() string {
	return GetVersion()
}

// SetInitialTool 设置启动时的工具名称
func (a *App) SetInitialTool(toolName string) {
	a.toolMu.Lock()
	defer a.toolMu.Unlock()
	a.initialTool = toolName
}

// GetInitialTool 获取启动时指定的工具名称
func (a *App) GetInitialTool() string {
	a.toolMu.RLock()
	defer a.toolMu.RUnlock()
	return a.initialTool
}

// ClearInitialTool 清除初始工具设置（用于防止重复切换）
func (a *App) ClearInitialTool() {
	a.toolMu.Lock()
	defer a.toolMu.Unlock()
	a.initialTool = ""
}

// NavigateToTool 导航到指定工具（供前端调用）
func (a *App) NavigateToTool(toolName string) bool {
	// 验证工具名称
	validTools := map[string]bool{
		"json":      true,
		"base64":    true,
		"timestamp": true,
		"uuid":      true,
		"url":       true,
		"qrcode":    true,
		"ipquery":   true,
	}

	toolName = strings.ToLower(strings.TrimSpace(toolName))
	if !validTools[toolName] {
		return false
	}

	// 设置工具名称，前端会通过 GetInitialTool 获取
	a.SetInitialTool(toolName)
	return true
}

// ShowHelp 显示使用说明（供菜单栏调用）
func (a *App) ShowHelp() {
	// 设置 initialTool 为 "help"，前端会检测到并显示帮助页面
	a.SetInitialTool("help")
}

// GetTheme 获取当前主题
func (a *App) GetTheme() string {
	return a.themeManager.Get()
}

// SetTheme 设置主题并持久化保存
func (a *App) SetTheme(theme string) error {
	return a.themeManager.Save(theme)
}
