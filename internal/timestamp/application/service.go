package application

import (
	"github.com/cyrnicolase/dev-tools/internal/timestamp/domain"
)

// Service 时间戳工具应用服务
type Service struct {
	converter *domain.Converter
	formatter *domain.Formatter
}

// NewService 创建新的 Service 实例
func NewService() *Service {
	return &Service{
		converter: domain.NewConverter(),
		formatter: domain.NewFormatter(),
	}
}

// TimestampToTimeString 时间戳转时间字符串
func (s *Service) TimestampToTimeString(timestamp int64, format string, timezone string) (string, error) {
	return s.converter.TimestampToTimeString(timestamp, format, timezone)
}

// TimeStringToTimestamp 时间字符串转时间戳
func (s *Service) TimeStringToTimestamp(timeStr string, format string, timezone string) (int64, error) {
	return s.converter.TimeStringToTimestamp(timeStr, format, timezone)
}

// FormatNow 格式化当前时间
func (s *Service) FormatNow(format string, timezone string) (string, error) {
	return s.formatter.FormatNow(format, timezone)
}

// GetCurrentTimestamp 获取当前时间戳
func (s *Service) GetCurrentTimestamp() int64 {
	return s.formatter.GetCurrentTimestamp()
}

// TimestampToTimeStringMilli 毫秒时间戳转时间字符串
func (s *Service) TimestampToTimeStringMilli(timestampMilli int64, format string, timezone string) (string, error) {
	return s.converter.TimestampToTimeStringMilli(timestampMilli, format, timezone)
}

// TimeStringToTimestampMilli 时间字符串转毫秒时间戳
func (s *Service) TimeStringToTimestampMilli(timeStr string, format string, timezone string) (int64, error) {
	return s.converter.TimeStringToTimestampMilli(timeStr, format, timezone)
}

// GetCurrentTimestampMilli 获取当前毫秒时间戳
func (s *Service) GetCurrentTimestampMilli() int64 {
	return s.formatter.GetCurrentTimestampMilli()
}
