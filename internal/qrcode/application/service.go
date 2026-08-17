package application

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/qrcode/domain"
	"github.com/pkg/errors"
)

// Service 二维码工具服务层
type Service struct {
	generator      *domain.Generator
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const qrcodeToolID = "qrcode"

// NewService 创建新的 Service 实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		generator:      domain.NewGenerator(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// Generate 生成二维码图片
func (s *Service) Generate(text string, size string) ([]byte, error) {
	sizeEnum := domain.Size(size)
	return s.generator.Generate(text, sizeEnum)
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(qrcodeToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = qrcodeToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(qrcodeToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
