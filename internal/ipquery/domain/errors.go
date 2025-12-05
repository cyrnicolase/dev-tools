package domain

// IPQueryError IP查询工具错误类型
type IPQueryError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e IPQueryError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrInvalidIPFormat 无效的IP地址格式
	ErrInvalidIPFormat = IPQueryError{Errmsg: "无效的IP地址格式"}
	// ErrHTTPRequestFailed HTTP请求失败
	ErrHTTPRequestFailed = IPQueryError{Errmsg: "HTTP请求失败"}
	// ErrHTTPStatusError HTTP状态码错误
	ErrHTTPStatusError = IPQueryError{Errmsg: "HTTP状态码错误"}
	// ErrReadResponseFailed 读取响应失败
	ErrReadResponseFailed = IPQueryError{Errmsg: "读取响应失败"}
	// ErrParseJSONFailed 解析JSON失败
	ErrParseJSONFailed = IPQueryError{Errmsg: "解析JSON失败"}
)

