package domain

import (
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

// Generator 提供 UUID 生成功能
type Generator struct{}

// NewGenerator 创建新的 Generator 实例
func NewGenerator() *Generator {
	return &Generator{}
}

// GenerateV1 生成 UUID v1（基于时间戳和 MAC 地址）
func (g *Generator) GenerateV1() string {
	id, _ := uuid.NewUUID()
	return id.String()
}

// GenerateV3 生成 UUID v3（基于命名空间和名称的 MD5）
func (g *Generator) GenerateV3(namespace, name string) (string, error) {
	nsUUID, err := uuid.Parse(namespace)
	if err != nil {
		return "", errors.Wrapf(err, "invalid namespace: %s", namespace)
	}
	id := uuid.NewMD5(nsUUID, []byte(name))
	return id.String(), nil
}

// GenerateV4 生成 UUID v4（随机）
func (g *Generator) GenerateV4() string {
	id := uuid.New()
	return id.String()
}

// GenerateV5 生成 UUID v5（基于命名空间和名称的 SHA-1）
func (g *Generator) GenerateV5(namespace, name string) (string, error) {
	nsUUID, err := uuid.Parse(namespace)
	if err != nil {
		return "", errors.Wrapf(err, "invalid namespace: %s", namespace)
	}
	id := uuid.NewSHA1(nsUUID, []byte(name))
	return id.String(), nil
}

// GenerateBatch 批量生成 UUID
func (g *Generator) GenerateBatch(version string, count int, namespace, name string) ([]string, error) {
	if count <= 0 {
		count = 1
	}
	if count > 1000 {
		count = 1000 // 限制最大数量
	}

	results := make([]string, 0, count)

	switch version {
	case "v1":
		for i := 0; i < count; i++ {
			results = append(results, g.GenerateV1())
		}
	case "v3":
		if namespace == "" || name == "" {
			return nil, ErrV3RequiresNamespaceAndName
		}
		for i := 0; i < count; i++ {
			id, err := g.GenerateV3(namespace, name)
			if err != nil {
				return nil, err
			}
			results = append(results, id)
		}
	case "v4":
		for i := 0; i < count; i++ {
			results = append(results, g.GenerateV4())
		}
	case "v5":
		if namespace == "" || name == "" {
			return nil, ErrV5RequiresNamespaceAndName
		}
		for i := 0; i < count; i++ {
			id, err := g.GenerateV5(namespace, name)
			if err != nil {
				return nil, err
			}
			results = append(results, id)
		}
	default:
		return nil, errors.Wrapf(ErrUnsupportedUUIDVersion, "unsupported UUID version: %s", version)
	}

	return results, nil
}

