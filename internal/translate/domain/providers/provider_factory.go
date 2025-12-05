package providers

import (
	"github.com/cyrnicolase/dev-tools/internal/translate/domain"
	"github.com/pkg/errors"
)

// NewProvider 创建翻译提供商实例
// providerType: 提供商类型（youdao, google等）
// config: 提供商配置（map[string]string）
func NewProvider(providerType string, config domain.ProviderConfig) (domain.Provider, error) {
	if !domain.IsValidProvider(providerType) {
		return nil, errors.Wrapf(domain.ErrInvalidProvider, "unknown provider: %s", providerType)
	}

	switch providerType {
	case domain.ProviderYoudao:
		appKey := config["appKey"]
		appSecret := config["appSecret"]
		if appKey == "" || appSecret == "" {
			return nil, errors.Wrapf(domain.ErrYoudaoAPIKeyMissing, "missing appKey or appSecret for provider: %s", providerType)
		}
		return NewYoudaoProvider(appKey, appSecret), nil

	// 以下提供商预留接口，待实现
	// case domain.ProviderGoogle:
	//     apiKey := config["apiKey"]
	//     return NewGoogleProvider(apiKey), nil
	// case domain.ProviderBaidu:
	//     appId := config["appId"]
	//     appSecret := config["appSecret"]
	//     return NewBaiduProvider(appId, appSecret), nil
	// case domain.ProviderDeepL:
	//     apiKey := config["apiKey"]
	//     return NewDeepLProvider(apiKey), nil

	default:
		return nil, errors.Wrapf(domain.ErrProviderNotImplemented, "provider not implemented: %s", providerType)
	}
}
