package handlers

import (
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/cyrnicolase/dev-tools/internal/ipquery/interfaces"
	"github.com/cyrnicolase/dev-tools/internal/logger"
)

// IPQueryHandler IP查询工具处理器
type IPQueryHandler struct {
	api *interfaces.API
}

// NewIPQueryHandler 创建新的 IPQueryHandler 实例
func NewIPQueryHandler() *IPQueryHandler {
	return &IPQueryHandler{
		api: interfaces.NewAPI(),
	}
}

// Query 查询IP地址
func (h *IPQueryHandler) Query(ip string) (string, error) {
	result, err := h.api.Query(ip)
	if err != nil {
		h.logError("Query", err)
	}
	return result, err
}

// logError 记录错误日志
func (h *IPQueryHandler) logError(method string, err error) {
	if err == nil {
		return
	}
	pc, file, line, ok := runtime.Caller(2)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		enhancedErr := fmt.Errorf("%s [%s:%d] %w", funcName, filepath.Base(file), line, err)
		logger.GetLogger().LogError("IPQueryHandler", method, enhancedErr)
	} else {
		logger.GetLogger().LogError("IPQueryHandler", method, err)
	}
}

