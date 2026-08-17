package handlers

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/ipquery/interfaces"
)

// IPQueryHandler IP查询工具处理器
type IPQueryHandler struct {
	api *interfaces.API
}

// NewIPQueryHandler 创建新的 IPQueryHandler 实例
func NewIPQueryHandler() *IPQueryHandler {
	return &IPQueryHandler{
		api: interfaces.NewAPI(),
	}
}

// Query 查询IP地址
func (h *IPQueryHandler) Query(ip string) (string, error) {
	return h.api.Query(ip)
}

// QueryBatch 批量查询IP地址
func (h *IPQueryHandler) QueryBatch(ips []string) (string, error) {
	return h.api.QueryBatch(ips)
}

// ListHistory 获取历史记录
func (h *IPQueryHandler) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	return h.api.ListHistory()
}

// AddHistory 添加历史记录
func (h *IPQueryHandler) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	return h.api.AddHistory(record)
}

// ClearHistory 清空历史记录
func (h *IPQueryHandler) ClearHistory() error {
	return h.api.ClearHistory()
}
