package domain

// TranslateError 翻译工具错误类型
type TranslateError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e TranslateError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrEmptyTranslateText 翻译文本为空
	ErrEmptyTranslateText = TranslateError{Errmsg: "翻译文本不能为空"}
	// ErrInvalidLanguagePair 不支持的语言对
	ErrInvalidLanguagePair = TranslateError{Errmsg: "不支持的语言对"}
	// ErrInvalidProvider 无效的提供商类型
	ErrInvalidProvider = TranslateError{Errmsg: "无效的提供商类型"}
	// ErrEmptyTranslationResult 翻译结果为空
	ErrEmptyTranslationResult = TranslateError{Errmsg: "翻译结果为空"}
	// ErrYoudaoAPIKeyNotConfigured 有道翻译API密钥未配置
	ErrYoudaoAPIKeyNotConfigured = TranslateError{Errmsg: "有道翻译API密钥未配置，请先在设置中配置"}
	// ErrYoudaoAPIKeyMissing 有道翻译API密钥缺失（创建提供商时）
	ErrYoudaoAPIKeyMissing = TranslateError{Errmsg: "有道翻译API密钥未配置"}
	// ErrProviderNotImplemented 提供商尚未实现
	ErrProviderNotImplemented = TranslateError{Errmsg: "提供商尚未实现"}
	// ErrYoudaoHTTPError 有道翻译HTTP请求错误
	ErrYoudaoHTTPError = TranslateError{Errmsg: "HTTP请求错误"}
	// ErrYoudaoTranslationFailed 有道翻译失败
	ErrYoudaoTranslationFailed = TranslateError{Errmsg: "翻译失败"}
)
