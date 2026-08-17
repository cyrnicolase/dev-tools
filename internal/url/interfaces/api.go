package interfaces

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/url/application"
)

// API URL 工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Encode 编码为 URL 编码格式
func (a *API) Encode(input string) string {
	return a.service.Encode(input)
}

// Decode 解码 URL 编码的字符串
func (a *API) Decode(input string) (string, error) {
	return a.service.Decode(input)
}

// ListHistory 获取历史记录
func (a *API) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	return a.service.ListHistory()
}

// AddHistory 添加历史记录
func (a *API) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	return a.service.AddHistory(record)
}

// ClearHistory 清空历史记录
func (a *API) ClearHistory() error {
	return a.service.ClearHistory()
}
