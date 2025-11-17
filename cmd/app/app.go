package app

import (
	"context"
	"strings"
	"sync"

	"github.com/cyrnicolase/dev-tools/cmd/app/handlers"
)

// App 应用主结构体，负责应用级别的功能
type App struct {
	ctx context.Context

	// 工具处理器
	JSON      *handlers.JSONHandler
	Base64    *handlers.Base64Handler
	Timestamp *handlers.TimestampHandler
	UUID      *handlers.UUIDHandler

	// 工具导航
	initialTool string
	toolMu      sync.RWMutex
}

// NewApp 创建新的 App 实例
func NewApp() *App {
	return &App{
		JSON:      handlers.NewJSONHandler(),
		Base64:    handlers.NewBase64Handler(),
		Timestamp: handlers.NewTimestampHandler(),
		UUID:      handlers.NewUUIDHandler(),
	}
}

// Startup 应用启动时的回调
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// GetVersion 获取应用版本号
func (a *App) GetVersion() string {
	return "1.0.6"
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

// NavigateToTool 导航到指定工具（供前端调用）
func (a *App) NavigateToTool(toolName string) bool {
	// 验证工具名称
	validTools := map[string]bool{
		"json":      true,
		"base64":    true,
		"timestamp": true,
		"uuid":      true,
	}

	toolName = strings.ToLower(strings.TrimSpace(toolName))
	if !validTools[toolName] {
		return false
	}

	// 设置工具名称，前端会通过 GetInitialTool 获取
	a.SetInitialTool(toolName)
	return true
}
