package domain

// Provider 翻译提供商接口
type Provider interface {
	// Translate 翻译文本
	// text: 待翻译文本
	// from: 源语言代码
	// to: 目标语言代码
	// 返回翻译结果和错误
	Translate(text, from, to string) (string, error)

	// GetName 获取提供商名称
	GetName() string

	// GetSupportedLanguages 获取支持的语言列表
	GetSupportedLanguages() []string
}

// 提供商类型常量
const (
	ProviderYoudao = "youdao"
	ProviderGoogle = "google"
	ProviderBaidu  = "baidu"
	ProviderDeepL  = "deepl"
)

// SupportedProviders 支持的提供商列表
var SupportedProviders = []string{
	ProviderYoudao,
	// 以下提供商预留接口，待实现
	// ProviderGoogle,
	// ProviderBaidu,
	// ProviderDeepL,
}

// IsValidProvider 验证提供商类型是否有效
func IsValidProvider(provider string) bool {
	for _, supported := range SupportedProviders {
		if provider == supported {
			return true
		}
	}
	return false
}
