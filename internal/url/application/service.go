package application

import (
	"github.com/cyrnicolase/dev-tools/internal/url/domain"
)

// Service URL 工具服务层
type Service struct {
	encoder *domain.Encoder
	decoder *domain.Decoder
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		encoder: domain.NewEncoder(),
		decoder: domain.NewDecoder(),
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

