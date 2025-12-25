package handlers

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	hashapi "github.com/cyrnicolase/dev-tools/internal/hash/interfaces"
)

// HashHandler 散列值计算工具处理器
type HashHandler struct {
	api *hashapi.API
	ctx context.Context
}

// NewHashHandler 创建新的 HashHandler 实例
func NewHashHandler() *HashHandler {
	return &HashHandler{
		api: hashapi.NewAPI(),
	}
}

// SetContext 设置上下文（用于文件对话框）
func (h *HashHandler) SetContext(ctx context.Context) {
	h.ctx = ctx
}

// HashText 计算文本的散列值
func (h *HashHandler) HashText(algorithm, text string) (string, error) {
	return h.api.HashText(algorithm, text)
}

// HashFile 计算文件的散列值
func (h *HashHandler) HashFile(algorithm, filePath string) (string, error) {
	// 验证文件路径
	if filePath == "" {
		return "", fmt.Errorf("文件路径不能为空")
	}

	// 检查文件是否存在
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("文件不存在: %s", filePath)
		}
		return "", fmt.Errorf("无法访问文件: %v", err)
	}

	// 检查是否是文件（不是目录）
	if fileInfo.IsDir() {
		return "", fmt.Errorf("路径指向的是目录，不是文件: %s", filePath)
	}

	// 读取文件内容
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("无法打开文件: %v", err)
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("无法读取文件内容: %v", err)
	}

	return h.api.HashFile(algorithm, fileData)
}

// OpenFileDialog 打开文件选择对话框
// 使用存储的 context，不需要前端传递
func (h *HashHandler) OpenFileDialog() (string, error) {
	// 如果存储的 ctx 为空，返回错误
	if h.ctx == nil {
		return "", fmt.Errorf("上下文未初始化")
	}
	
	filePath, err := runtime.OpenFileDialog(h.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
	})
	if err != nil {
		return "", err
	}
	// 如果用户取消选择，返回空字符串（不是错误）
	if filePath == "" {
		return "", nil
	}
	return filePath, nil
}

