package domain

// JSONError JSON工具错误类型
type JSONError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e JSONError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrEmptyYAMLInput YAML输入为空
	ErrEmptyYAMLInput = JSONError{Errmsg: "YAML 输入为空"}
	// ErrYAMLParseFailed YAML解析失败
	ErrYAMLParseFailed = JSONError{Errmsg: "YAML 解析失败"}
	// ErrYAMLGenerateFailed YAML生成失败
	ErrYAMLGenerateFailed = JSONError{Errmsg: "YAML 生成失败"}
	// ErrJSONConvertFailed JSON转换失败
	ErrJSONConvertFailed = JSONError{Errmsg: "JSON 转换失败"}
)

