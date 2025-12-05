package domain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"

	"github.com/pkg/errors"
)

const (
	indentStep = "  " // 缩进步长
)

// Formatter 提供 JSON 格式化功能
type Formatter struct{}

// NewFormatter 创建新的 Formatter 实例
func NewFormatter() *Formatter {
	return &Formatter{}
}

// Format 美化 JSON 字符串
func (f *Formatter) Format(input string) (string, error) {
	return f.FormatWithEscape(input, true)
}

// FormatWithEscape 美化 JSON 字符串，支持控制是否保留转义字符
// preserveEscape: true 保留转义字符，false 转换转义字符为实际字符
func (f *Formatter) FormatWithEscape(input string, preserveEscape bool) (string, error) {
	var jsonObj interface{}
	if err := json.Unmarshal([]byte(input), &jsonObj); err != nil {
		return "", errors.WithStack(err)
	}

	if preserveEscape {
		// 保留转义：使用标准的 JSON 格式化
		// 先对 map 的 key 进行排序，确保输出顺序一致
		sortedObj := f.sortMapKeys(jsonObj)
		formatted, err := json.MarshalIndent(sortedObj, "", indentStep)
		if err != nil {
			return "", err
		}
		return string(formatted), nil
	}

	// 不保留转义：递归处理字符串值，将转义序列转换为实际字符
	processedObj := f.processEscapeSequences(jsonObj)
	// 使用自定义格式化，在字符串值中去掉转义字符
	return f.formatWithoutEscape(processedObj, "", indentStep), nil
}

// sortMapKeys 递归排序 map 的 key，确保输出顺序一致
func (f *Formatter) sortMapKeys(obj interface{}) interface{} {
	switch v := obj.(type) {
	case map[string]interface{}:
		// 创建有序的 map（使用 slice 存储 key 顺序）
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		// 创建新的 map，按排序后的 key 顺序处理值
		result := make(map[string]interface{})
		for _, k := range keys {
			result[k] = f.sortMapKeys(v[k])
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, val := range v {
			result[i] = f.sortMapKeys(val)
		}
		return result
	default:
		return v
	}
}

// processEscapeSequences 递归处理对象，将字符串中的转义序列转换为实际字符
func (f *Formatter) processEscapeSequences(obj interface{}) interface{} {
	switch v := obj.(type) {
	case string:
		// 将转义序列转换为实际字符
		return f.unescapeString(v)
	case map[string]interface{}:
		result := make(map[string]interface{})
		for k, val := range v {
			result[k] = f.processEscapeSequences(val)
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, val := range v {
			result[i] = f.processEscapeSequences(val)
		}
		return result
	default:
		return v
	}
}

// unescapeString 将 JSON 转义序列转换为实际字符
// 例如：将 "hello\\nworld" 转换为包含实际换行符的字符串
func (f *Formatter) unescapeString(s string) string {
	// 使用 json.Unmarshal 来解析转义序列
	// 将字符串包装在 JSON 引号中，然后解析
	var result string
	jsonStr := `"` + s + `"`
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// 如果解析失败，返回原字符串
		return s
	}
	return result
}

// formatWithoutEscape 自定义格式化 JSON，字符串值中不转义特殊字符
func (f *Formatter) formatWithoutEscape(obj interface{}, indent, indentStep string) string {
	switch v := obj.(type) {
	case map[string]interface{}:
		return f.formatMap(v, indent, indentStep)
	case []interface{}:
		return f.formatArray(v, indent, indentStep)
	case string:
		// 字符串值：直接输出，不转义（不符合 JSON 规范，但符合用户需求）
		return `"` + v + `"`
	case float64:
		return f.formatNumber(v)
	case bool:
		return strconv.FormatBool(v)
	case nil:
		return "null"
	default:
		// 其他类型：使用标准 JSON 编码
		jsonBytes, err := json.Marshal(v)
		if err != nil {
			return "null"
		}
		return string(jsonBytes)
	}
}

// formatMap 格式化 map 对象
func (f *Formatter) formatMap(m map[string]interface{}, indent, indentStep string) string {
	if len(m) == 0 {
		return "{}"
	}

	var buf bytes.Buffer
	buf.WriteString("{\n")
	nextIndent := indent + indentStep

	// 对 key 进行排序，确保输出顺序一致
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for i, k := range keys {
		if i > 0 {
			buf.WriteString(",\n")
		}

		buf.WriteString(nextIndent)
		buf.WriteString(`"`)
		buf.WriteString(f.escapeKey(k))
		buf.WriteString(`": `)
		buf.WriteString(f.formatWithoutEscape(m[k], nextIndent, indentStep))
	}

	buf.WriteString("\n")
	buf.WriteString(indent)
	buf.WriteString("}")
	return buf.String()
}

// formatArray 格式化数组对象
func (f *Formatter) formatArray(arr []interface{}, indent, indentStep string) string {
	if len(arr) == 0 {
		return "[]"
	}

	var buf bytes.Buffer
	buf.WriteString("[\n")
	nextIndent := indent + indentStep

	for i, val := range arr {
		if i > 0 {
			buf.WriteString(",\n")
		}
		buf.WriteString(nextIndent)
		buf.WriteString(f.formatWithoutEscape(val, nextIndent, indentStep))
	}

	buf.WriteString("\n")
	buf.WriteString(indent)
	buf.WriteString("]")
	return buf.String()
}

// formatNumber 格式化数字，整数不显示小数点
func (f *Formatter) formatNumber(v float64) string {
	if v == float64(int64(v)) {
		return strconv.FormatInt(int64(v), 10)
	}
	return strconv.FormatFloat(v, 'f', -1, 64)
}

// escapeKey 转义 JSON 键名中的特殊字符
func (f *Formatter) escapeKey(s string) string {
	var buf bytes.Buffer
	for _, r := range s {
		switch r {
		case '"':
			buf.WriteString(`\"`)
		case '\\':
			buf.WriteString(`\\`)
		case '\b':
			buf.WriteString(`\b`)
		case '\f':
			buf.WriteString(`\f`)
		case '\n':
			buf.WriteString(`\n`)
		case '\r':
			buf.WriteString(`\r`)
		case '\t':
			buf.WriteString(`\t`)
		default:
			if r < 0x20 {
				buf.WriteString(fmt.Sprintf(`\u%04x`, r))
			} else {
				buf.WriteRune(r)
			}
		}
	}
	return buf.String()
}

// Minify 压缩 JSON 字符串
func (f *Formatter) Minify(input string) (string, error) {
	var jsonObj interface{}
	if err := json.Unmarshal([]byte(input), &jsonObj); err != nil {
		return "", errors.WithStack(err)
	}

	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)
	if err := encoder.Encode(jsonObj); err != nil {
		return "", err
	}

	// 移除末尾的换行符
	result := buf.String()
	if len(result) > 0 && result[len(result)-1] == '\n' {
		result = result[:len(result)-1]
	}

	return result, nil
}
