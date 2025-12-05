package domain

import (
	"time"

	"github.com/pkg/errors"
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
func (c *Converter) TimestampToTimeString(timestamp int64, format string, timezone string) (string, error) {
	t := c.TimestampToTime(timestamp)
	return c.formatter.FormatTime(t, format, timezone)
}

// TimeStringToTimestamp 将时间字符串转换为时间戳
func (c *Converter) TimeStringToTimestamp(timeStr string, format string, timezone string) (int64, error) {
	// 加载时区
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		// 如果时区无效，回退到 UTC
		loc = time.UTC
	}

	var t time.Time

	// 检查格式是否包含时区信息
	actualFormat := c.getActualFormat(format)
	formatHasTimezone := c.formatRequiresTimezone(format)

	if formatHasTimezone {
		// 对于包含时区信息的格式（如 RFC3339），先尝试标准解析
		// 如果输入包含时区信息，使用输入的时区；否则使用选择的时区
		parsedTime, parseErr := time.Parse(actualFormat, timeStr)
		if parseErr == nil {
			// 解析成功，使用解析出的时间（可能包含时区信息）
			t = parsedTime
		} else {
			// 标准解析失败，输入可能没有时区信息，使用选择的时区解析
			formatsToTry := c.getFormatsToTry(format, timeStr)

			var lastErr error
			for _, fmtStr := range formatsToTry {
				t, err = time.ParseInLocation(fmtStr, timeStr, loc)
				if err == nil {
					// 解析成功
					break
				}
				lastErr = err
			}

			if err != nil {
				return 0, errors.Wrapf(lastErr, "failed to parse time")
			}
		}
	} else {
		// 对于不包含时区信息的格式（如 DateTime、Date、Time），
		// 直接使用选择的时区解析，不使用 time.Parse（因为 time.Parse 会使用 UTC）
		t, err = time.ParseInLocation(actualFormat, timeStr, loc)
		if err != nil {
			return 0, errors.Wrapf(err, "failed to parse time")
		}
	}

	// 转换为 UTC 时间戳
	return c.TimeToTimestamp(t), nil
}

// formatRequiresTimezone 检查格式是否要求时区信息
func (c *Converter) formatRequiresTimezone(format string) bool {
	switch format {
	case "RFC3339", "RFC3339Nano", "RFC822", "RFC822Z", "RFC1123", "RFC1123Z":
		return true
	case "DateTime", "Date", "Time":
		return false
	default:
		// 对于未知格式，假设不要求时区信息，使用选择的时区
		return false
	}
}

// getFormatsToTry 根据格式和输入字符串，返回要尝试的格式列表
// 格式按优先级排序，最精确的格式优先
func (c *Converter) getFormatsToTry(format string, timeStr string) []string {
	formats := []string{}

	// 检查输入是否包含纳秒
	hasNano := false
	nanoLen := 0
	if len(timeStr) > 19 && timeStr[19] == '.' {
		hasNano = true
		// 计算纳秒部分的长度
		nanoEnd := len(timeStr)
		for i := 20; i < len(timeStr); i++ {
			if timeStr[i] == '+' || timeStr[i] == '-' || timeStr[i] == 'Z' {
				nanoEnd = i
				break
			}
		}
		nanoLen = nanoEnd - 20
	}

	switch format {
	case "RFC3339":
		if hasNano {
			// 输入有纳秒，根据纳秒长度尝试不同精度的格式
			// 优先尝试最精确的格式
			if nanoLen >= 9 {
				formats = append(formats, "2006-01-02T15:04:05.999999999")
			}
			if nanoLen >= 6 {
				formats = append(formats, "2006-01-02T15:04:05.999999")
			}
			if nanoLen >= 3 {
				formats = append(formats, "2006-01-02T15:04:05.999")
			}
			// 也尝试通用格式
			formats = append(formats, "2006-01-02T15:04:05.999999999")
		}
		formats = append(formats, "2006-01-02T15:04:05")
	case "RFC3339Nano":
		// RFC3339Nano 优先尝试带纳秒的格式
		formats = append(formats, "2006-01-02T15:04:05.999999999")
		if !hasNano {
			// 输入没有纳秒，也尝试不带纳秒的格式
			formats = append(formats, "2006-01-02T15:04:05")
		}
	case "RFC822", "RFC822Z":
		formats = append(formats, "02 Jan 06 15:04")
	case "RFC1123", "RFC1123Z":
		formats = append(formats, "Mon, 02 Jan 2006 15:04:05")
	default:
		// 其他格式（DateTime、Date、Time）本身就不包含时区信息
		actualFormat := c.getActualFormat(format)
		formats = append(formats, actualFormat)
	}

	return formats
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
func (c *Converter) TimestampToTimeStringMilli(timestampMilli int64, format string, timezone string) (string, error) {
	// 毫秒时间戳转换为秒级时间戳
	timestamp := timestampMilli / 1000
	t := c.TimestampToTime(timestamp)
	return c.formatter.FormatTime(t, format, timezone)
}

// TimeStringToTimestampMilli 将时间字符串转换为毫秒时间戳
func (c *Converter) TimeStringToTimestampMilli(timeStr string, format string, timezone string) (int64, error) {
	timestamp, err := c.TimeStringToTimestamp(timeStr, format, timezone)
	if err != nil {
		return 0, err
	}
	// 秒级时间戳转换为毫秒时间戳
	return timestamp * 1000, nil
}
