package application

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/url/domain"
	"github.com/pkg/errors"
)

// Service URL 工具服务层
type Service struct {
	encoder        *domain.Encoder
	decoder        *domain.Decoder
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const urlToolID = "url"

// NewService 创建新的 Service 实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		encoder:        domain.NewEncoder(),
		decoder:        domain.NewDecoder(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// Encode 编码为 URL 编码格式
func (s *Service) Encode(input string) string {
	return s.encoder.Encode(input)
}

// Decode 解码 URL 编码的字符串
func (s *Service) Decode(input string) (string, error) {
	return s.decoder.Decode(input)
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(urlToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = urlToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(urlToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
