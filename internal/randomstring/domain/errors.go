package domain

// RandomStringError 随机字符串工具错误类型
type RandomStringError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e RandomStringError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrInvalidLength 长度无效
	ErrInvalidLength = RandomStringError{Errmsg: "字符串长度必须在1-100之间"}
	// ErrNoCharTypeSelected 未选择字符类型
	ErrNoCharTypeSelected = RandomStringError{Errmsg: "至少需要选择一个字符类型"}
)

