package application

import (
	"github.com/cyrnicolase/dev-tools/internal/hash/domain"
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/pkg/errors"
)

// Service 散列值计算应用服务
type Service struct {
	hasher         *domain.Hasher
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const hashToolID = "hash"

// NewService 创建新的 Service 实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		hasher:         domain.NewHasher(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// HashText 计算文本的散列值
func (s *Service) HashText(algorithm, text string) (string, error) {
	return s.hasher.Hash(algorithm, []byte(text))
}

// HashFile 计算文件的散列值
func (s *Service) HashFile(algorithm string, fileData []byte) (string, error) {
	return s.hasher.Hash(algorithm, fileData)
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(hashToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = hashToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(hashToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
