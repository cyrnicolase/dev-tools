package application

import (
	"github.com/cyrnicolase/dev-tools/internal/randomstring/domain"
)

// Service 随机字符串工具应用服务
type Service struct {
	generator *domain.Generator
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		generator: domain.NewGenerator(),
	}
}

// Generate 生成单个随机字符串
func (s *Service) Generate(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool) (string, error) {
	return s.generator.Generate(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial)
}

// GenerateBatch 批量生成随机字符串
func (s *Service) GenerateBatch(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool, count int) ([]string, error) {
	return s.generator.GenerateBatch(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial, count)
}

