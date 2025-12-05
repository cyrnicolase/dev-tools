package handlers

import (
	"github.com/cyrnicolase/dev-tools/internal/translate/interfaces"
)

// TranslateHandler 翻译工具处理器
type TranslateHandler struct {
	api *interfaces.API
}

// NewTranslateHandler 创建新的 TranslateHandler 实例
func NewTranslateHandler() *TranslateHandler {
	return &TranslateHandler{
		api: interfaces.NewAPI(),
	}
}

// Translate 翻译文本
func (h *TranslateHandler) Translate(text, from, to string) (string, error) {
	return h.api.Translate(text, from, to)
}

// GetProviders 获取支持的提供商列表
func (h *TranslateHandler) GetProviders() (string, error) {
	return h.api.GetProviders()
}

// GetDefaultProvider 获取默认提供商
func (h *TranslateHandler) GetDefaultProvider() (string, error) {
	return h.api.GetDefaultProvider()
}

// SetDefaultProvider 设置默认提供商
func (h *TranslateHandler) SetDefaultProvider(provider string) error {
	return h.api.SetDefaultProvider(provider)
}

// GetProviderConfig 获取提供商配置
func (h *TranslateHandler) GetProviderConfig(provider string) (string, error) {
	return h.api.GetProviderConfig(provider)
}

// SaveProviderConfig 保存提供商配置
func (h *TranslateHandler) SaveProviderConfig(provider, configJSON string) error {
	return h.api.SaveProviderConfig(provider, configJSON)
}
