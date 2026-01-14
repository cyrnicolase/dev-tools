package handlers

import (
	"context"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	jsonapi "github.com/cyrnicolase/dev-tools/internal/json/interfaces"
)

// JSONHandler JSON 工具处理器
type JSONHandler struct {
	api *jsonapi.API
	ctx context.Context
}

// NewJSONHandler 创建新的 JSONHandler 实例
func NewJSONHandler() *JSONHandler {
	return &JSONHandler{
		api: jsonapi.NewAPI(),
	}
}

// SetContext 设置上下文（用于文件对话框）
func (h *JSONHandler) SetContext(ctx context.Context) {
	h.ctx = ctx
}

// Format 格式化 JSON
func (h *JSONHandler) Format(input string) (string, error) {
	return h.api.Format(input)
}

// FormatWithEscape 格式化 JSON，支持控制是否保留转义字符
func (h *JSONHandler) FormatWithEscape(input string, preserveEscape bool) (string, error) {
	return h.api.FormatWithEscape(input, preserveEscape)
}

// Minify 压缩 JSON
func (h *JSONHandler) Minify(input string) (string, error) {
	return h.api.Minify(input)
}

// Validate 验证 JSON
func (h *JSONHandler) Validate(input string) (bool, error) {
	return h.api.Validate(input)
}

// ToYAML 将 JSON 转换为 YAML
func (h *JSONHandler) ToYAML(input string) (string, error) {
	return h.api.ToYAML(input)
}

// FromYAML 将 YAML 转换为 JSON
func (h *JSONHandler) FromYAML(input string) (string, error) {
	return h.api.FromYAML(input)
}

// SaveFileDialog 打开保存文件对话框并保存内容
func (h *JSONHandler) SaveFileDialog(content string) error {
	// 如果存储的 ctx 为空，返回错误
	if h.ctx == nil {
		return fmt.Errorf("上下文未初始化")
	}

	// 打开保存文件对话框
	filePath, err := runtime.SaveFileDialog(h.ctx, runtime.SaveDialogOptions{
		Title:           "保存 JSON 文件",
		DefaultFilename: "untitled.json",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON Files (*.json)",
				Pattern:     "*.json",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("打开保存对话框失败: %v", err)
	}

	// 如果用户取消保存，返回空（不是错误）
	if filePath == "" {
		return nil
	}

	// 写入文件
	err = os.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("保存文件失败: %v", err)
	}

	return nil
}
