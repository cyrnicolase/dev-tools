package handlers

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/url/interfaces"
)

// URLHandler URL 工具处理器
type URLHandler struct {
	api *interfaces.API
}

// NewURLHandler 创建新的 URLHandler 实例
func NewURLHandler() *URLHandler {
	return &URLHandler{
		api: interfaces.NewAPI(),
	}
}

// Encode 编码为 URL 编码格式
func (h *URLHandler) Encode(input string) string {
	return h.api.Encode(input)
}

// Decode 解码 URL 编码的字符串
func (h *URLHandler) Decode(input string) (string, error) {
	return h.api.Decode(input)
}

// ListHistory 获取历史记录
func (h *URLHandler) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	return h.api.ListHistory()
}

// AddHistory 添加历史记录
func (h *URLHandler) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	return h.api.AddHistory(record)
}

// ClearHistory 清空历史记录
func (h *URLHandler) ClearHistory() error {
	return h.api.ClearHistory()
}
