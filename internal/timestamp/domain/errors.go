package domain

// TimestampError 时间戳工具错误类型
type TimestampError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e TimestampError) Error() string {
	return e.Errmsg
}

// 预定义错误
var (
	// ErrInvalidHistoryRecord 无效历史记录
	ErrInvalidHistoryRecord = TimestampError{Errmsg: "无效的历史记录"}
	// ErrHistoryStoreUnavailable 历史存储不可用
	ErrHistoryStoreUnavailable = TimestampError{Errmsg: "历史记录存储不可用"}
)
