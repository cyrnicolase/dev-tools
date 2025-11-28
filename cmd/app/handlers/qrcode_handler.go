package handlers

import (
	"github.com/cyrnicolase/dev-tools/internal/qrcode/interfaces"
)

// QRCodeHandler 二维码工具处理器
type QRCodeHandler struct {
	api *interfaces.API
}

// NewQRCodeHandler 创建新的 QRCodeHandler 实例
func NewQRCodeHandler() *QRCodeHandler {
	return &QRCodeHandler{
		api: interfaces.NewAPI(),
	}
}

// Generate 生成二维码，返回 base64 编码的图片数据
func (h *QRCodeHandler) Generate(text string, size string) (string, error) {
	return h.api.Generate(text, size)
}

// GenerateImage 生成二维码，返回原始 PNG 字节数组（用于下载）
func (h *QRCodeHandler) GenerateImage(text string, size string) ([]byte, error) {
	return h.api.GenerateImage(text, size)
}

