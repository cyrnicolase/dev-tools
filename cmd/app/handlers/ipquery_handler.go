package handlers

import (
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
