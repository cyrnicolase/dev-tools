package handlers

import (
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/cyrnicolase/dev-tools/internal/logger"
	uuidapi "github.com/cyrnicolase/dev-tools/internal/uuid/interfaces"
)

// UUIDHandler UUID 工具处理器
type UUIDHandler struct {
	api *uuidapi.API
}

// NewUUIDHandler 创建新的 UUIDHandler 实例
func NewUUIDHandler() *UUIDHandler {
	return &UUIDHandler{
		api: uuidapi.NewAPI(),
	}
}

// GenerateV1 生成 UUID v1
func (h *UUIDHandler) GenerateV1() string {
	return h.api.GenerateV1()
}

// GenerateV3 生成 UUID v3
func (h *UUIDHandler) GenerateV3(namespace, name string) (string, error) {
	result, err := h.api.GenerateV3(namespace, name)
	if err != nil {
		h.logError("GenerateV3", err)
	}
	return result, err
}

// GenerateV4 生成 UUID v4
func (h *UUIDHandler) GenerateV4() string {
	return h.api.GenerateV4()
}

// GenerateV5 生成 UUID v5
func (h *UUIDHandler) GenerateV5(namespace, name string) (string, error) {
	result, err := h.api.GenerateV5(namespace, name)
	if err != nil {
		h.logError("GenerateV5", err)
	}
	return result, err
}

// GenerateBatch 批量生成 UUID
func (h *UUIDHandler) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	result, err := h.api.GenerateBatch(version, count, namespace, name)
	if err != nil {
		h.logError("GenerateBatch", err)
	}
	return result, err
}

// logError 记录错误日志
func (h *UUIDHandler) logError(method string, err error) {
	if err == nil {
		return
	}
	pc, file, line, ok := runtime.Caller(2)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		enhancedErr := fmt.Errorf("%s [%s:%d] %w", funcName, filepath.Base(file), line, err)
		logger.MustGetLogger().LogError("UUIDHandler", method, enhancedErr)
	} else {
		logger.MustGetLogger().LogError("UUIDHandler", method, err)
	}
}
