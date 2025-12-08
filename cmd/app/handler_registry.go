package app

import (
	"github.com/cyrnicolase/dev-tools/cmd/app/handlers"
)

// HandlerRegistry 处理器注册表
// 负责管理和提供所有工具处理器
type HandlerRegistry struct {
	JSON      *handlers.JSONHandler
	Base64    *handlers.Base64Handler
	Timestamp *handlers.TimestampHandler
	UUID      *handlers.UUIDHandler
	URL       *handlers.URLHandler
	QRCode    *handlers.QRCodeHandler
	IPQuery   *handlers.IPQueryHandler
	Translate *handlers.TranslateHandler
}

// NewHandlerRegistry 创建新的处理器注册表
func NewHandlerRegistry() *HandlerRegistry {
	return &HandlerRegistry{
		JSON:      handlers.NewJSONHandler(),
		Base64:    handlers.NewBase64Handler(),
		Timestamp: handlers.NewTimestampHandler(),
		UUID:      handlers.NewUUIDHandler(),
		URL:       handlers.NewURLHandler(),
		QRCode:    handlers.NewQRCodeHandler(),
		IPQuery:   handlers.NewIPQueryHandler(),
		Translate: handlers.NewTranslateHandler(),
	}
}

