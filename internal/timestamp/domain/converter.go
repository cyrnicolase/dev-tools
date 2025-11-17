package domain

import (
	"fmt"
	"time"
)

// Converter 提供时间戳转换功能
type Converter struct {
	formatter *Formatter
}

// NewConverter 创建新的 Converter 实例
func NewConverter() *Converter {
	return &Converter{
		formatter: NewFormatter(),
	}
}

// TimestampToTime 将时间戳转换为时间
func (c *Converter) TimestampToTime(timestamp int64) time.Time {
	return time.Unix(timestamp, 0)
}

// TimeToTimestamp 将时间转换为时间戳
func (c *Converter) TimeToTimestamp(t time.Time) int64 {
	return t.Unix()
}

// TimestampToTimeString 将时间戳转换为时间字符串
func (c *Converter) TimestampToTimeString(timestamp int64, format string) (string, error) {
	t := c.TimestampToTime(timestamp)
	return c.formatter.FormatTime(t, format)
}

// TimeStringToTimestamp 将时间字符串转换为时间戳
func (c *Converter) TimeStringToTimestamp(timeStr string, format string) (int64, error) {
	// 将格式名称转换为实际的 Go 时间格式字符串
	actualFormat := c.getActualFormat(format)
	t, err := time.Parse(actualFormat, timeStr)
	if err != nil {
		return 0, fmt.Errorf("failed to parse time: %w", err)
	}
	return c.TimeToTimestamp(t), nil
}

// getActualFormat 将格式名称转换为实际的 Go 时间格式字符串
func (c *Converter) getActualFormat(format string) string {
	switch format {
	case "RFC3339":
		return time.RFC3339
	case "RFC3339Nano":
		return time.RFC3339Nano
	case "RFC822":
		return time.RFC822
	case "RFC822Z":
		return time.RFC822Z
	case "RFC1123":
		return time.RFC1123
	case "RFC1123Z":
		return time.RFC1123Z
	case "UnixDate":
		return time.UnixDate
	case "RubyDate":
		return time.RubyDate
	case "Kitchen":
		return time.Kitchen
	case "Stamp":
		return time.Stamp
	case "StampMilli":
		return time.StampMilli
	case "StampMicro":
		return time.StampMicro
	case "StampNano":
		return time.StampNano
	case "DateTime":
		return "2006-01-02 15:04:05"
	case "Date":
		return "2006-01-02"
	case "Time":
		return "15:04:05"
	default:
		// 如果格式不是预定义的，直接使用原格式
		return format
	}
}

// TimestampToTimeStringMilli 将毫秒时间戳转换为时间字符串
func (c *Converter) TimestampToTimeStringMilli(timestampMilli int64, format string) (string, error) {
	// 毫秒时间戳转换为秒级时间戳
	timestamp := timestampMilli / 1000
	t := c.TimestampToTime(timestamp)
	return c.formatter.FormatTime(t, format)
}

// TimeStringToTimestampMilli 将时间字符串转换为毫秒时间戳
func (c *Converter) TimeStringToTimestampMilli(timeStr string, format string) (int64, error) {
	timestamp, err := c.TimeStringToTimestamp(timeStr, format)
	if err != nil {
		return 0, err
	}
	// 秒级时间戳转换为毫秒时间戳
	return timestamp * 1000, nil
}
