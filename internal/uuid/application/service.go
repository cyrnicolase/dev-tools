package application

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/uuid/domain"
	"github.com/pkg/errors"
)

// Service UUID 工具应用服务
type Service struct {
	generator      *domain.Generator
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const uuidToolID = "uuid"

// NewService 创建新的 Service 实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		generator:      domain.NewGenerator(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// GenerateV1 生成 UUID v1
func (s *Service) GenerateV1() string {
	return s.generator.GenerateV1()
}

// GenerateV3 生成 UUID v3
func (s *Service) GenerateV3(namespace, name string) (string, error) {
	return s.generator.GenerateV3(namespace, name)
}

// GenerateV4 生成 UUID v4
func (s *Service) GenerateV4() string {
	return s.generator.GenerateV4()
}

// GenerateV7 生成 UUID v7
func (s *Service) GenerateV7() (string, error) {
	return s.generator.GenerateV7()
}

// GenerateV5 生成 UUID v5
func (s *Service) GenerateV5(namespace, name string) (string, error) {
	return s.generator.GenerateV5(namespace, name)
}

// GenerateBatch 批量生成 UUID
func (s *Service) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	return s.generator.GenerateBatch(version, count, namespace, name)
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(uuidToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = uuidToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(uuidToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
