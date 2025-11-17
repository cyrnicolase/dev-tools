package handlers

import (
	timestampapi "github.com/cyrnicolase/dev-tools/internal/timestamp/interfaces"
)

// TimestampHandler 时间戳工具处理器
type TimestampHandler struct {
	api *timestampapi.API
}

// NewTimestampHandler 创建新的 TimestampHandler 实例
func NewTimestampHandler() *TimestampHandler {
	return &TimestampHandler{
		api: timestampapi.NewAPI(),
	}
}

// TimestampToTimeString 时间戳转时间字符串
func (h *TimestampHandler) TimestampToTimeString(timestamp int64, format string) (string, error) {
	return h.api.TimestampToTimeString(timestamp, format)
}

// TimeStringToTimestamp 时间字符串转时间戳
func (h *TimestampHandler) TimeStringToTimestamp(timeStr string, format string) (int64, error) {
	return h.api.TimeStringToTimestamp(timeStr, format)
}

// FormatNow 格式化当前时间
func (h *TimestampHandler) FormatNow(format string) (string, error) {
	return h.api.FormatNow(format)
}

// GetCurrentTimestamp 获取当前时间戳
func (h *TimestampHandler) GetCurrentTimestamp() int64 {
	return h.api.GetCurrentTimestamp()
}

// TimestampToTimeStringMilli 毫秒时间戳转时间字符串
func (h *TimestampHandler) TimestampToTimeStringMilli(timestampMilli int64, format string) (string, error) {
	return h.api.TimestampToTimeStringMilli(timestampMilli, format)
}

// TimeStringToTimestampMilli 时间字符串转毫秒时间戳
func (h *TimestampHandler) TimeStringToTimestampMilli(timeStr string, format string) (int64, error) {
	return h.api.TimeStringToTimestampMilli(timeStr, format)
}

// GetCurrentTimestampMilli 获取当前毫秒时间戳
func (h *TimestampHandler) GetCurrentTimestampMilli() int64 {
	return h.api.GetCurrentTimestampMilli()
}
