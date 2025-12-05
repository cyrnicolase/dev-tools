package domain

// ThemeError 主题工具错误类型
type ThemeError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e ThemeError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrInvalidTheme 无效的主题值
	ErrInvalidTheme = ThemeError{Errmsg: "无效的主题值"}
)
