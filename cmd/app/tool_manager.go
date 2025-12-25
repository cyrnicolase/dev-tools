package app

import (
	"context"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	// ToolChangedEvent 工具切换事件名称
	ToolChangedEvent = "tool-changed"
)

// ToolManager 工具管理器
// 负责工具切换、导航和状态管理
type ToolManager struct {
	tools            []string
	currentToolIndex int
	initialTool      string
	mu               sync.RWMutex
	ctx              context.Context
}

// NewToolManager 创建新的工具管理器
func NewToolManager() *ToolManager {
	return &ToolManager{
		tools: []string{
			"json",
			"base64",
			"timestamp",
			"uuid",
			"url",
			"qrcode",
			"ipquery",
			"translate",
			"hash",
		},
		currentToolIndex: 0,
	}
}

// SetContext 设置上下文（用于事件发送）
func (tm *ToolManager) SetContext(ctx context.Context) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	tm.ctx = ctx
}

// isValidTool 验证工具名称是否有效
// 包括工具列表中的工具和特殊视图（如 "help"）
func (tm *ToolManager) isValidTool(toolName string) bool {
	toolName = strings.ToLower(strings.TrimSpace(toolName))

	// 检查特殊视图
	if toolName == "help" {
		return true
	}

	// 检查工具列表
	for _, tool := range tm.tools {
		if tool == toolName {
			return true
		}
	}
	return false
}

// findToolIndex 查找工具在列表中的索引，如果未找到返回 -1
func (tm *ToolManager) findToolIndex(toolID string) int {
	toolID = strings.ToLower(strings.TrimSpace(toolID))
	for i, tool := range tm.tools {
		if tool == toolID {
			return i
		}
	}
	return -1
}

// switchToTool 切换到指定工具（内部方法，不发送事件）
func (tm *ToolManager) switchToTool(toolID string) bool {
	// 处理特殊视图（如 "help"），它们不在工具列表中
	if toolID == "help" {
		tm.initialTool = toolID
		return true
	}

	// 处理普通工具
	index := tm.findToolIndex(toolID)
	if index < 0 {
		return false
	}
	tm.currentToolIndex = index
	tm.initialTool = toolID
	return true
}

// SetInitialTool 设置启动时的工具名称
func (tm *ToolManager) SetInitialTool(toolName string) {
	tm.mu.Lock()
	toolID := strings.ToLower(strings.TrimSpace(toolName))
	if !tm.isValidTool(toolID) {
		tm.mu.Unlock()
		return
	}

	tm.switchToTool(toolID)
	// 在释放锁之前获取上下文
	ctx := tm.ctx
	tm.mu.Unlock()

	// 发送事件通知前端（用于外部调用，如 Alfred）
	// 注意：必须在释放锁之后发送事件，避免死锁
	if ctx != nil && toolID != "" {
		runtime.EventsEmit(ctx, ToolChangedEvent, toolID)
	}
}

// GetInitialTool 获取启动时指定的工具名称
func (tm *ToolManager) GetInitialTool() string {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	return tm.initialTool
}

// ClearInitialTool 清除初始工具设置（用于防止重复切换）
func (tm *ToolManager) ClearInitialTool() {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	tm.initialTool = ""
}

// NavigateToTool 导航到指定工具（供前端调用）
func (tm *ToolManager) NavigateToTool(toolName string) bool {
	toolID := strings.ToLower(strings.TrimSpace(toolName))
	if !tm.isValidTool(toolID) {
		return false
	}
	tm.SetInitialTool(toolID)
	return true
}

// ShowHelp 显示使用说明（供菜单栏调用）
func (tm *ToolManager) ShowHelp() {
	tm.SetInitialTool("help")
}

// NextTool 切换到下一个工具（循环）
func (tm *ToolManager) NextTool() {
	tm.mu.Lock()
	if len(tm.tools) == 0 {
		tm.mu.Unlock()
		return
	}
	tm.currentToolIndex = (tm.currentToolIndex + 1) % len(tm.tools)
	toolID := tm.tools[tm.currentToolIndex]
	tm.mu.Unlock()

	// SetInitialTool 内部会发送事件，避免重复发送
	tm.SetInitialTool(toolID)
}

// PreviousTool 切换到上一个工具（循环）
func (tm *ToolManager) PreviousTool() {
	tm.mu.Lock()
	if len(tm.tools) == 0 {
		tm.mu.Unlock()
		return
	}
	tm.currentToolIndex = (tm.currentToolIndex - 1 + len(tm.tools)) % len(tm.tools)
	toolID := tm.tools[tm.currentToolIndex]
	tm.mu.Unlock()

	// SetInitialTool 内部会发送事件，避免重复发送
	tm.SetInitialTool(toolID)
}

// GetCurrentTool 获取当前工具ID
func (tm *ToolManager) GetCurrentTool() string {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	if len(tm.tools) == 0 {
		return ""
	}
	if tm.currentToolIndex < 0 || tm.currentToolIndex >= len(tm.tools) {
		return tm.tools[0]
	}
	return tm.tools[tm.currentToolIndex]
}

// SetCurrentTool 设置当前工具（供前端同步状态，不发送事件）
func (tm *ToolManager) SetCurrentTool(toolID string) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if !tm.isValidTool(toolID) {
		return
	}

	index := tm.findToolIndex(toolID)
	if index >= 0 {
		tm.currentToolIndex = index
	}
}
