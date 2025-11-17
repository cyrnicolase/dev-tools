package application

import (
	"github.com/cyrnicolase/dev-tools/internal/uuid/domain"
)

// Service UUID 工具应用服务
type Service struct {
	generator *domain.Generator
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		generator: domain.NewGenerator(),
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

// GenerateV5 生成 UUID v5
func (s *Service) GenerateV5(namespace, name string) (string, error) {
	return s.generator.GenerateV5(namespace, name)
}

// GenerateBatch 批量生成 UUID
func (s *Service) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	return s.generator.GenerateBatch(version, count, namespace, name)
}

