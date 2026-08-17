package interfaces

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/randomstring/application"
)

// API 随机字符串工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Generate 生成单个随机字符串
func (a *API) Generate(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool) (string, error) {
	return a.service.Generate(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial)
}

// GenerateBatch 批量生成随机字符串
func (a *API) GenerateBatch(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool, count int) ([]string, error) {
	return a.service.GenerateBatch(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial, count)
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
