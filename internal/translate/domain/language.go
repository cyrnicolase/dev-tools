package domain

// 语言代码常量
const (
	LanguageZH = "zh" // 中文
	LanguageEN = "en" // 英文
	LanguageKO = "ko" // 韩文
)

// LanguageNames 语言显示名称映射
var LanguageNames = map[string]string{
	LanguageZH: "中文",
	LanguageEN: "英文",
	LanguageKO: "韩文",
}

// SupportedLanguages 支持的语言列表
var SupportedLanguages = []string{LanguageZH, LanguageEN, LanguageKO}

// IsValidLanguage 验证语言代码是否有效
func IsValidLanguage(lang string) bool {
	for _, supportedLang := range SupportedLanguages {
		if lang == supportedLang {
			return true
		}
	}
	return false
}

// IsValidLanguagePair 验证语言对是否有效（确保支持的翻译方向）
func IsValidLanguagePair(from, to string) bool {
	if !IsValidLanguage(from) || !IsValidLanguage(to) {
		return false
	}
	if from == to {
		return false
	}
	return true
}

// ConvertToProviderCode 将内部语言代码转换为提供商API语言代码
// provider: 提供商类型（youdao, google等）
func ConvertToProviderCode(lang, provider string) string {
	switch provider {
	case "youdao":
		return convertToYoudaoCode(lang)
	default:
		return lang
	}
}

// convertToYoudaoCode 转换为有道API语言代码
func convertToYoudaoCode(lang string) string {
	switch lang {
	case LanguageZH:
		return "zh-CHS"
	case LanguageEN:
		return "en"
	case LanguageKO:
		return "ko"
	default:
		return lang
	}
}
