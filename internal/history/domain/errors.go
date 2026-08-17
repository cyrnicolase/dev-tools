package domain

// HistoryError 历史记录模块错误类型
type HistoryError struct {
	Errmsg string
}

// Error 实现 error 接口
func (e HistoryError) Error() string {
	return e.Errmsg
}

// 预定义错误
var (
	// ErrInvalidToolHistoryRecord 无效工具历史记录
	ErrInvalidToolHistoryRecord = HistoryError{Errmsg: "无效的工具历史记录"}
	// ErrHistoryStoreUnavailable 历史存储不可用
	ErrHistoryStoreUnavailable = HistoryError{Errmsg: "历史记录存储不可用"}
)
