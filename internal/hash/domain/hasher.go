package domain

import (
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
)

// Hasher 提供散列计算功能
type Hasher struct{}

// NewHasher 创建新的 Hasher 实例
func NewHasher() *Hasher {
	return &Hasher{}
}

// HashMD5 计算 MD5 散列值
func (h *Hasher) HashMD5(data []byte) string {
	hash := md5.Sum(data)
	return hex.EncodeToString(hash[:])
}

// HashSHA1 计算 SHA1 散列值
func (h *Hasher) HashSHA1(data []byte) string {
	hash := sha1.Sum(data)
	return hex.EncodeToString(hash[:])
}

// HashSHA256 计算 SHA256 散列值
func (h *Hasher) HashSHA256(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

// HashSHA512 计算 SHA512 散列值
func (h *Hasher) HashSHA512(data []byte) string {
	hash := sha512.Sum512(data)
	return hex.EncodeToString(hash[:])
}

// Hash 根据算法名称计算散列值
func (h *Hasher) Hash(algorithm string, data []byte) (string, error) {
	switch algorithm {
	case "md5":
		return h.HashMD5(data), nil
	case "sha1":
		return h.HashSHA1(data), nil
	case "sha256":
		return h.HashSHA256(data), nil
	case "sha512":
		return h.HashSHA512(data), nil
	default:
		return "", fmt.Errorf("不支持的散列算法: %s", algorithm)
	}
}
