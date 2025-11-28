package application

import (
	"github.com/cyrnicolase/dev-tools/internal/qrcode/domain"
)

// Service 二维码工具服务层
type Service struct {
	generator *domain.Generator
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		generator: domain.NewGenerator(),
	}
}

// Generate 生成二维码图片
func (s *Service) Generate(text string, size string) ([]byte, error) {
	sizeEnum := domain.Size(size)
	return s.generator.Generate(text, sizeEnum)
}

