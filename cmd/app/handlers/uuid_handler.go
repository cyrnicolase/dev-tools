package handlers

import (
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
	return h.api.GenerateV3(namespace, name)
}

// GenerateV4 生成 UUID v4
func (h *UUIDHandler) GenerateV4() string {
	return h.api.GenerateV4()
}

// GenerateV5 生成 UUID v5
func (h *UUIDHandler) GenerateV5(namespace, name string) (string, error) {
	return h.api.GenerateV5(namespace, name)
}

// GenerateBatch 批量生成 UUID
func (h *UUIDHandler) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	return h.api.GenerateBatch(version, count, namespace, name)
}
