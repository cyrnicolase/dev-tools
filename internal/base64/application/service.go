package application

import (
	"github.com/cyrnicolase/dev-tools/internal/base64/domain"
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/pkg/errors"
)

// Service Base64 工具应用服务
type Service struct {
	encoder        *domain.Encoder
	decoder        *domain.Decoder
	validator      *domain.Validator
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const base64ToolID = "base64"

// NewService 创建新的 Service 实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		encoder:        domain.NewEncoder(),
		decoder:        domain.NewDecoder(),
		validator:      domain.NewValidator(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// Encode 编码为 Base64
func (s *Service) Encode(input string) string {
	return s.encoder.Encode(input)
}

// EncodeURLSafe 编码为 URL 安全的 Base64
func (s *Service) EncodeURLSafe(input string) string {
	return s.encoder.EncodeURLSafe(input)
}

// Decode 解码 Base64
func (s *Service) Decode(input string) (string, error) {
	return s.decoder.Decode(input)
}

// DecodeURLSafe 解码 URL 安全的 Base64
func (s *Service) DecodeURLSafe(input string) (string, error) {
	return s.decoder.DecodeURLSafe(input)
}

// Validate 验证 Base64
func (s *Service) Validate(input string) bool {
	return s.validator.Validate(input)
}

// ValidateURLSafe 验证 URL 安全的 Base64
func (s *Service) ValidateURLSafe(input string) bool {
	return s.validator.ValidateURLSafe(input)
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(base64ToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = base64ToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(base64ToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
