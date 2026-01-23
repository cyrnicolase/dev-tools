package application

import (
	"sync"

	"github.com/cyrnicolase/dev-tools/internal/ipquery/domain"
)

// Service IP查询服务
type Service struct {
	queryer *domain.Queryer
}

// NewService 创建新的服务实例
func NewService() *Service {
	return &Service{
		queryer: domain.NewQueryer(),
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

