package interfaces

import (
	"encoding/base64"

	"github.com/cyrnicolase/dev-tools/internal/qrcode/application"
)

// API 二维码工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Generate 生成二维码，返回 base64 编码的图片数据
func (a *API) Generate(text string, size string) (string, error) {
	png, err := a.service.Generate(text, size)
	if err != nil {
		return "", err
	}

	// 转换为 base64 编码
	base64Str := base64.StdEncoding.EncodeToString(png)
	return base64Str, nil
}

// GenerateImage 生成二维码，返回原始 PNG 字节数组（用于下载）
func (a *API) GenerateImage(text string, size string) ([]byte, error) {
	return a.service.Generate(text, size)
}

