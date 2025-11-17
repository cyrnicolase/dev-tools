package handlers

import (
	"fmt"
	"path/filepath"
	"runtime"

	jsonapi "github.com/cyrnicolase/dev-tools/internal/json/interfaces"
	"github.com/cyrnicolase/dev-tools/internal/logger"
)

// JSONHandler JSON 工具处理器
type JSONHandler struct {
	api *jsonapi.API
}

// NewJSONHandler 创建新的 JSONHandler 实例
func NewJSONHandler() *JSONHandler {
	return &JSONHandler{
		api: jsonapi.NewAPI(),
	}
}

// Format 格式化 JSON
func (h *JSONHandler) Format(input string) (string, error) {
	result, err := h.api.Format(input)
	if err != nil {
		h.logError("Format", err)
	}
	return result, err
}

// FormatWithEscape 格式化 JSON，支持控制是否保留转义字符
func (h *JSONHandler) FormatWithEscape(input string, preserveEscape bool) (string, error) {
	result, err := h.api.FormatWithEscape(input, preserveEscape)
	if err != nil {
		h.logError("FormatWithEscape", err)
	}
	return result, err
}

// Minify 压缩 JSON
func (h *JSONHandler) Minify(input string) (string, error) {
	result, err := h.api.Minify(input)
	if err != nil {
		h.logError("Minify", err)
	}
	return result, err
}

// Validate 验证 JSON
func (h *JSONHandler) Validate(input string) (bool, error) {
	result, err := h.api.Validate(input)
	if err != nil {
		h.logError("Validate", err)
	}
	return result, err
}

// ToYAML 将 JSON 转换为 YAML
func (h *JSONHandler) ToYAML(input string) (string, error) {
	result, err := h.api.ToYAML(input)
	if err != nil {
		h.logError("ToYAML", err)
	}
	return result, err
}

// FromYAML 将 YAML 转换为 JSON
func (h *JSONHandler) FromYAML(input string) (string, error) {
	result, err := h.api.FromYAML(input)
	if err != nil {
		h.logError("FromYAML", err)
	}
	return result, err
}

// logError 记录错误日志
func (h *JSONHandler) logError(method string, err error) {
	if err == nil {
		return
	}
	// 获取调用者信息
	pc, file, line, ok := runtime.Caller(2)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		enhancedErr := fmt.Errorf("%s [%s:%d] %w", funcName, filepath.Base(file), line, err)
		logger.GetLogger().LogError("JSONHandler", method, enhancedErr)
	} else {
		logger.GetLogger().LogError("JSONHandler", method, err)
	}
}
