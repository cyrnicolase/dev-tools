package domain

import (
	"time"
)

// Formatter 提供时间格式化功能
type Formatter struct{}

// NewFormatter 创建新的 Formatter 实例
func NewFormatter() *Formatter {
	return &Formatter{}
}

// FormatTime 格式化时间为指定格式
func (f *Formatter) FormatTime(t time.Time, format string) (string, error) {
	if format == "" {
		format = time.RFC3339
	}

	// 支持常用格式
	switch format {
	case "RFC3339":
		return t.Format(time.RFC3339), nil
	case "RFC3339Nano":
		return t.Format(time.RFC3339Nano), nil
	case "RFC822":
		return t.Format(time.RFC822), nil
	case "RFC822Z":
		return t.Format(time.RFC822Z), nil
	case "RFC1123":
		return t.Format(time.RFC1123), nil
	case "RFC1123Z":
		return t.Format(time.RFC1123Z), nil
	case "UnixDate":
		return t.Format(time.UnixDate), nil
	case "RubyDate":
		return t.Format(time.RubyDate), nil
	case "Kitchen":
		return t.Format(time.Kitchen), nil
	case "Stamp":
		return t.Format(time.Stamp), nil
	case "StampMilli":
		return t.Format(time.StampMilli), nil
	case "StampMicro":
		return t.Format(time.StampMicro), nil
	case "StampNano":
		return t.Format(time.StampNano), nil
	case "DateTime":
		return t.Format("2006-01-02 15:04:05"), nil
	case "Date":
		return t.Format("2006-01-02"), nil
	case "Time":
		return t.Format("15:04:05"), nil
	default:
		// 尝试作为 Go 时间格式解析
		return t.Format(format), nil
	}
}

// FormatNow 格式化当前时间
func (f *Formatter) FormatNow(format string) (string, error) {
	return f.FormatTime(time.Now(), format)
}

// GetCurrentTimestamp 获取当前时间戳
func (f *Formatter) GetCurrentTimestamp() int64 {
	return time.Now().Unix()
}

// GetCurrentTimestampMilli 获取当前时间戳（毫秒）
func (f *Formatter) GetCurrentTimestampMilli() int64 {
	return time.Now().UnixMilli()
}
