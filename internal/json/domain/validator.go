package domain

import (
	"encoding/json"

	"github.com/pkg/errors"
)

// Validator 提供 JSON 验证功能
type Validator struct{}

// NewValidator 创建新的 Validator 实例
func NewValidator() *Validator {
	return &Validator{}
}

// Validate 验证 JSON 字符串是否有效
func (v *Validator) Validate(input string) error {
	var jsonObj interface{}
	if err := json.Unmarshal([]byte(input), &jsonObj); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// IsValid 检查 JSON 字符串是否有效，返回布尔值
func (v *Validator) IsValid(input string) bool {
	return v.Validate(input) == nil
}
