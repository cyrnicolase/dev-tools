package application

import (
	"github.com/cyrnicolase/dev-tools/internal/json/domain"
)

// Service JSON 工具应用服务
type Service struct {
	formatter *domain.Formatter
	validator *domain.Validator
	converter *domain.Converter
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		formatter: domain.NewFormatter(),
		validator: domain.NewValidator(),
		converter: domain.NewConverter(),
	}
}

// FormatJSON 格式化 JSON
func (s *Service) FormatJSON(input string) (string, error) {
	return s.formatter.Format(input)
}

// FormatJSONWithEscape 格式化 JSON，支持控制是否保留转义字符
func (s *Service) FormatJSONWithEscape(input string, preserveEscape bool) (string, error) {
	return s.formatter.FormatWithEscape(input, preserveEscape)
}

// MinifyJSON 压缩 JSON
func (s *Service) MinifyJSON(input string) (string, error) {
	return s.formatter.Minify(input)
}

// ValidateJSON 验证 JSON
func (s *Service) ValidateJSON(input string) error {
	return s.validator.Validate(input)
}

// JSONToYAML 将 JSON 转换为 YAML
func (s *Service) JSONToYAML(input string) (string, error) {
	return s.converter.ToYAML(input)
}

// YAMLToJSON 将 YAML 转换为 JSON
func (s *Service) YAMLToJSON(input string) (string, error) {
	return s.converter.FromYAML(input)
}
