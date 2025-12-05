package handlers

import (
	jsonapi "github.com/cyrnicolase/dev-tools/internal/json/interfaces"
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
	return h.api.Format(input)
}

// FormatWithEscape 格式化 JSON，支持控制是否保留转义字符
func (h *JSONHandler) FormatWithEscape(input string, preserveEscape bool) (string, error) {
	return h.api.FormatWithEscape(input, preserveEscape)
}

// Minify 压缩 JSON
func (h *JSONHandler) Minify(input string) (string, error) {
	return h.api.Minify(input)
}

// Validate 验证 JSON
func (h *JSONHandler) Validate(input string) (bool, error) {
	return h.api.Validate(input)
}

// ToYAML 将 JSON 转换为 YAML
func (h *JSONHandler) ToYAML(input string) (string, error) {
	return h.api.ToYAML(input)
}

// FromYAML 将 YAML 转换为 JSON
func (h *JSONHandler) FromYAML(input string) (string, error) {
	return h.api.FromYAML(input)
}
