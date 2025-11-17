package application

import (
	"github.com/cyrnicolase/dev-tools/internal/base64/domain"
)

// Service Base64 工具应用服务
type Service struct {
	encoder   *domain.Encoder
	decoder   *domain.Decoder
	validator *domain.Validator
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		encoder:   domain.NewEncoder(),
		decoder:   domain.NewDecoder(),
		validator: domain.NewValidator(),
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
