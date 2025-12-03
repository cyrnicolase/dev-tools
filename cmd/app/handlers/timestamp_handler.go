package handlers

import (
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/cyrnicolase/dev-tools/internal/logger"
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
	result, err := h.api.TimestampToTimeString(timestamp, format)
	if err != nil {
		h.logError("TimestampToTimeString", err)
	}
	return result, err
}

// TimeStringToTimestamp 时间字符串转时间戳
func (h *TimestampHandler) TimeStringToTimestamp(timeStr string, format string) (int64, error) {
	result, err := h.api.TimeStringToTimestamp(timeStr, format)
	if err != nil {
		h.logError("TimeStringToTimestamp", err)
	}
	return result, err
}

// FormatNow 格式化当前时间
func (h *TimestampHandler) FormatNow(format string) (string, error) {
	result, err := h.api.FormatNow(format)
	if err != nil {
		h.logError("FormatNow", err)
	}
	return result, err
}

// GetCurrentTimestamp 获取当前时间戳
func (h *TimestampHandler) GetCurrentTimestamp() int64 {
	return h.api.GetCurrentTimestamp()
}

// TimestampToTimeStringMilli 毫秒时间戳转时间字符串
func (h *TimestampHandler) TimestampToTimeStringMilli(timestampMilli int64, format string) (string, error) {
	result, err := h.api.TimestampToTimeStringMilli(timestampMilli, format)
	if err != nil {
		h.logError("TimestampToTimeStringMilli", err)
	}
	return result, err
}

// TimeStringToTimestampMilli 时间字符串转毫秒时间戳
func (h *TimestampHandler) TimeStringToTimestampMilli(timeStr string, format string) (int64, error) {
	result, err := h.api.TimeStringToTimestampMilli(timeStr, format)
	if err != nil {
		h.logError("TimeStringToTimestampMilli", err)
	}
	return result, err
}

// GetCurrentTimestampMilli 获取当前毫秒时间戳
func (h *TimestampHandler) GetCurrentTimestampMilli() int64 {
	return h.api.GetCurrentTimestampMilli()
}

// logError 记录错误日志
func (h *TimestampHandler) logError(method string, err error) {
	if err == nil {
		return
	}
	pc, file, line, ok := runtime.Caller(2)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		enhancedErr := fmt.Errorf("%s [%s:%d] %w", funcName, filepath.Base(file), line, err)
		logger.MustGetLogger().LogError("TimestampHandler", method, enhancedErr)
	} else {
		logger.MustGetLogger().LogError("TimestampHandler", method, err)
	}
}
