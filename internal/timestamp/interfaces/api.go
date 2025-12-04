package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/timestamp/application"
)

// API 时间戳工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// TimestampToTimeString 时间戳转时间字符串
func (a *API) TimestampToTimeString(timestamp int64, format string, timezone string) (string, error) {
	return a.service.TimestampToTimeString(timestamp, format, timezone)
}

// TimeStringToTimestamp 时间字符串转时间戳
func (a *API) TimeStringToTimestamp(timeStr string, format string, timezone string) (int64, error) {
	return a.service.TimeStringToTimestamp(timeStr, format, timezone)
}

// FormatNow 格式化当前时间
func (a *API) FormatNow(format string, timezone string) (string, error) {
	return a.service.FormatNow(format, timezone)
}

// GetCurrentTimestamp 获取当前时间戳
func (a *API) GetCurrentTimestamp() int64 {
	return a.service.GetCurrentTimestamp()
}

// TimestampToTimeStringMilli 毫秒时间戳转时间字符串
func (a *API) TimestampToTimeStringMilli(timestamp int64, format string, timezone string) (string, error) {
	return a.service.TimestampToTimeStringMilli(timestamp, format, timezone)
}

// TimeStringToTimestampMilli 时间字符串转毫秒时间戳
func (a *API) TimeStringToTimestampMilli(timeStr string, format string, timezone string) (int64, error) {
	return a.service.TimeStringToTimestampMilli(timeStr, format, timezone)
}

// GetCurrentTimestampMilli 获取当前毫秒时间戳
func (a *API) GetCurrentTimestampMilli() int64 {
	return a.service.GetCurrentTimestampMilli()
}
