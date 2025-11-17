package domain

import "encoding/base64"

// Validator 提供 Base64 验证功能
type Validator struct{}

// NewValidator 创建新的 Validator 实例
func NewValidator() *Validator {
	return &Validator{}
}

// Validate 验证字符串是否为有效的 Base64
func (v *Validator) Validate(input string) bool {
	_, err := base64.StdEncoding.DecodeString(input)
	return err == nil
}

// ValidateURLSafe 验证字符串是否为有效的 URL 安全 Base64
func (v *Validator) ValidateURLSafe(input string) bool {
	_, err := base64.URLEncoding.DecodeString(input)
	return err == nil
}
