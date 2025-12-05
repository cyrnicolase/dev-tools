package domain

// UUIDError UUID工具错误类型
type UUIDError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e UUIDError) Error() string {
	return e.Errmsg
}

// 预定义的错误
var (
	// ErrV3RequiresNamespaceAndName v3版本需要命名空间和名称
	ErrV3RequiresNamespaceAndName = UUIDError{Errmsg: "v3 requires namespace and name"}
	// ErrV5RequiresNamespaceAndName v5版本需要命名空间和名称
	ErrV5RequiresNamespaceAndName = UUIDError{Errmsg: "v5 requires namespace and name"}
	// ErrUnsupportedUUIDVersion 不支持的UUID版本
	ErrUnsupportedUUIDVersion = UUIDError{Errmsg: "不支持的UUID版本"}
)

