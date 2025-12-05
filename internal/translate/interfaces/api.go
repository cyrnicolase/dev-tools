package interfaces

import (
	"encoding/json"

	"github.com/cyrnicolase/dev-tools/internal/translate/application"
	"github.com/cyrnicolase/dev-tools/internal/translate/domain"
	"github.com/pkg/errors"
)

// API 翻译工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Translate 翻译文本
func (a *API) Translate(text, from, to string) (string, error) {
	return a.service.Translate(text, from, to)
}

// GetProviders 获取支持的提供商列表（返回JSON字符串）
func (a *API) GetProviders() (string, error) {
	providers := a.service.GetSupportedProviders()
	jsonData, err := json.Marshal(providers)
	if err != nil {
		return "", errors.WithStack(err)
	}
	return string(jsonData), nil
}

// GetDefaultProvider 获取默认提供商
func (a *API) GetDefaultProvider() (string, error) {
	return a.service.GetDefaultProvider(), nil
}

// SetDefaultProvider 设置默认提供商
func (a *API) SetDefaultProvider(provider string) error {
	return a.service.SetDefaultProvider(provider)
}

// GetProviderConfig 获取提供商配置（返回JSON字符串）
func (a *API) GetProviderConfig(provider string) (string, error) {
	config, err := a.service.GetProviderConfig(provider)
	if err != nil {
		return "", err
	}
	jsonData, err := json.Marshal(config)
	if err != nil {
		return "", errors.WithStack(err)
	}
	return string(jsonData), nil
}

// SaveProviderConfig 保存提供商配置
// configJSON: 配置的JSON字符串
func (a *API) SaveProviderConfig(provider, configJSON string) error {
	var config domain.ProviderConfig
	if err := json.Unmarshal([]byte(configJSON), &config); err != nil {
		return errors.WithStack(err)
	}
	return a.service.SaveProviderConfig(provider, config)
}
