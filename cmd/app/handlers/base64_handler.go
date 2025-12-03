package handlers

import (
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/cyrnicolase/dev-tools/internal/base64/interfaces"
	"github.com/cyrnicolase/dev-tools/internal/logger"
)

// Base64Handler Base64 工具处理器
type Base64Handler struct {
	api *interfaces.API
}

// NewBase64Handler 创建新的 Base64Handler 实例
func NewBase64Handler() *Base64Handler {
	return &Base64Handler{
		api: interfaces.NewAPI(),
	}
}

// Encode 编码为 Base64
func (h *Base64Handler) Encode(input string) string {
	return h.api.Encode(input)
}

// EncodeURLSafe 编码为 URL 安全的 Base64
func (h *Base64Handler) EncodeURLSafe(input string) string {
	return h.api.EncodeURLSafe(input)
}

// Decode 解码 Base64
func (h *Base64Handler) Decode(input string) (string, error) {
	result, err := h.api.Decode(input)
	if err != nil {
		h.logError("Decode", err)
	}
	return result, err
}

// DecodeURLSafe 解码 URL 安全的 Base64
func (h *Base64Handler) DecodeURLSafe(input string) (string, error) {
	result, err := h.api.DecodeURLSafe(input)
	if err != nil {
		h.logError("DecodeURLSafe", err)
	}
	return result, err
}

// logError 记录错误日志
func (h *Base64Handler) logError(method string, err error) {
	if err == nil {
		return
	}
	pc, file, line, ok := runtime.Caller(2)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		enhancedErr := fmt.Errorf("%s [%s:%d] %w", funcName, filepath.Base(file), line, err)
		logger.MustGetLogger().LogError("Base64Handler", method, enhancedErr)
	} else {
		logger.MustGetLogger().LogError("Base64Handler", method, err)
	}
}

// Validate 验证 Base64
func (h *Base64Handler) Validate(input string) bool {
	return h.api.Validate(input)
}

// ValidateURLSafe 验证 URL 安全的 Base64
func (h *Base64Handler) ValidateURLSafe(input string) bool {
	return h.api.ValidateURLSafe(input)
}
