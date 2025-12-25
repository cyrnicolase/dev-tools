package application

import (
	"github.com/cyrnicolase/dev-tools/internal/hash/domain"
)

// Service 散列值计算应用服务
type Service struct {
	hasher *domain.Hasher
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		hasher: domain.NewHasher(),
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

