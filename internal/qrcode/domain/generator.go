package domain

import (
	"fmt"

	"github.com/skip2/go-qrcode"
)

// Generator 二维码生成器
type Generator struct{}

// NewGenerator 创建新的 Generator 实例
func NewGenerator() *Generator {
	return &Generator{}
}

// Size 二维码尺寸
type Size string

const (
	SizeSmall  Size = "small"  // 256x256
	SizeMedium Size = "medium" // 512x512
	SizeLarge  Size = "large"  // 1024x1024
)

// GetSizeInPixels 获取尺寸对应的像素值
func (s Size) GetSizeInPixels() int {
	switch s {
	case SizeSmall:
		return 256
	case SizeMedium:
		return 512
	case SizeLarge:
		return 1024
	default:
		return 512 // 默认中等尺寸
	}
}

// Generate 生成二维码图片
// 返回 PNG 格式的字节数组
func (g *Generator) Generate(text string, size Size) ([]byte, error) {
	if text == "" {
		return nil, fmt.Errorf("输入文本不能为空")
	}

	pixels := size.GetSizeInPixels()
	
	// 使用 Medium 错误纠正级别（默认）
	qr, err := qrcode.New(text, qrcode.Medium)
	if err != nil {
		return nil, fmt.Errorf("生成二维码失败: %w", err)
	}

	// 生成 PNG 图片
	png, err := qr.PNG(pixels)
	if err != nil {
		return nil, fmt.Errorf("生成 PNG 图片失败: %w", err)
	}

	return png, nil
}

