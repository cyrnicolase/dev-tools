package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/json/application"
)

// API JSON 工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Format 格式化 JSON
func (a *API) Format(input string) (string, error) {
	return a.service.FormatJSON(input)
}

// FormatWithEscape 格式化 JSON，支持控制是否保留转义字符
func (a *API) FormatWithEscape(input string, preserveEscape bool) (string, error) {
	return a.service.FormatJSONWithEscape(input, preserveEscape)
}

// Minify 压缩 JSON
func (a *API) Minify(input string) (string, error) {
	return a.service.MinifyJSON(input)
}

// Validate 验证 JSON
func (a *API) Validate(input string) (bool, error) {
	err := a.service.ValidateJSON(input)
	return err == nil, err
}

// ToYAML 将 JSON 转换为 YAML
func (a *API) ToYAML(input string) (string, error) {
	return a.service.JSONToYAML(input)
}

// FromYAML 将 YAML 转换为 JSON
func (a *API) FromYAML(input string) (string, error) {
	return a.service.YAMLToJSON(input)
}
