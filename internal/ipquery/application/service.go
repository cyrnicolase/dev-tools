package application

import (
	"sync"

	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/ipquery/domain"
	"github.com/pkg/errors"
)

// Service IP查询服务
type Service struct {
	queryer        *domain.Queryer
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const ipQueryToolID = "ipquery"

// NewService 创建新的服务实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		queryer:        domain.NewQueryer(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// QueryIP 查询IP地址，并发调用两个API源
func (s *Service) QueryIP(ip string) ([]domain.QueryResult, error) {
	// 先验证IP地址格式
	if err := s.queryer.ValidateIP(ip); err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	var results []domain.QueryResult
	var mu sync.Mutex

	// 并发查询两个API源
	wg.Add(2)

	go func() {
		defer wg.Done()
		result := s.queryer.QueryIPAPI(ip)
		mu.Lock()
		results = append(results, result)
		mu.Unlock()
	}()

	go func() {
		defer wg.Done()
		result := s.queryer.QueryIPInfo(ip)
		mu.Lock()
		results = append(results, result)
		mu.Unlock()
	}()

	wg.Wait()

	return results, nil
}

// QueryBatch 批量查询IP地址
func (s *Service) QueryBatch(ips []string) ([]domain.BatchQueryResult, error) {
	if len(ips) == 0 {
		return nil, nil
	}

	// 调用domain层的批量查询方法
	results := s.queryer.QueryBatch(ips)
	return results, nil
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(ipQueryToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = ipQueryToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(ipQueryToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
