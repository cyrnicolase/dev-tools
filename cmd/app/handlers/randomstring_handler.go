package handlers

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	randomstringapi "github.com/cyrnicolase/dev-tools/internal/randomstring/interfaces"
)

// RandomStringHandler 随机字符串工具处理器
type RandomStringHandler struct {
	api *randomstringapi.API
}

// NewRandomStringHandler 创建新的 RandomStringHandler 实例
func NewRandomStringHandler() *RandomStringHandler {
	return &RandomStringHandler{
		api: randomstringapi.NewAPI(),
	}
}

// Generate 生成单个随机字符串
func (h *RandomStringHandler) Generate(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool) (string, error) {
	return h.api.Generate(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial)
}

// GenerateBatch 批量生成随机字符串
func (h *RandomStringHandler) GenerateBatch(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool, count int) ([]string, error) {
	return h.api.GenerateBatch(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial, count)
}

// ListHistory 获取历史记录
func (h *RandomStringHandler) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	return h.api.ListHistory()
}

// AddHistory 添加历史记录
func (h *RandomStringHandler) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	return h.api.AddHistory(record)
}

// ClearHistory 清空历史记录
func (h *RandomStringHandler) ClearHistory() error {
	return h.api.ClearHistory()
}
