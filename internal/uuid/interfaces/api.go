package interfaces

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/uuid/application"
)

// API UUID 工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// GenerateV1 生成 UUID v1
func (a *API) GenerateV1() string {
	return a.service.GenerateV1()
}

// GenerateV3 生成 UUID v3
func (a *API) GenerateV3(namespace, name string) (string, error) {
	return a.service.GenerateV3(namespace, name)
}

// GenerateV4 生成 UUID v4
func (a *API) GenerateV4() string {
	return a.service.GenerateV4()
}

// GenerateV7 生成 UUID v7
func (a *API) GenerateV7() (string, error) {
	return a.service.GenerateV7()
}

// GenerateV5 生成 UUID v5
func (a *API) GenerateV5(namespace, name string) (string, error) {
	return a.service.GenerateV5(namespace, name)
}

// GenerateBatch 批量生成 UUID
func (a *API) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	return a.service.GenerateBatch(version, count, namespace, name)
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
