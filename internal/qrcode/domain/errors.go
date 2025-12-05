package domain

// QRCodeError 二维码工具错误类型
type QRCodeError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e QRCodeError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrEmptyInputText 输入文本不能为空
	ErrEmptyInputText = QRCodeError{Errmsg: "输入文本不能为空"}
	// ErrGenerateQRCodeFailed 生成二维码失败
	ErrGenerateQRCodeFailed = QRCodeError{Errmsg: "生成二维码失败"}
	// ErrGeneratePNGFailed 生成PNG图片失败
	ErrGeneratePNGFailed = QRCodeError{Errmsg: "生成PNG图片失败"}
)

