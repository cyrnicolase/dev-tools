package domain

import (
	"encoding/json"
	"fmt"
	"strings"

	"gopkg.in/yaml.v3"
)

// Converter 提供 JSON 与其他格式转换功能
type Converter struct{}

// NewConverter 创建新的 Converter 实例
func NewConverter() *Converter {
	return &Converter{}
}

// ToYAML 将 JSON 转换为 YAML
func (c *Converter) ToYAML(input string) (string, error) {
	var jsonObj interface{}
	if err := json.Unmarshal([]byte(input), &jsonObj); err != nil {
		return "", fmt.Errorf("JSON 解析失败: %v", err)
	}

	// 使用标准 YAML 库生成 YAML，确保格式正确
	yamlBytes, err := yaml.Marshal(jsonObj)
	if err != nil {
		return "", fmt.Errorf("YAML 生成失败: %v", err)
	}

	return string(yamlBytes), nil
}

// FromYAML 将 YAML 转换为 JSON
func (c *Converter) FromYAML(input string) (string, error) {
	// 如果输入为空，返回错误
	if len(strings.TrimSpace(input)) == 0 {
		return "", fmt.Errorf("YAML 输入为空")
	}

	var yamlObj interface{}
	if err := yaml.Unmarshal([]byte(input), &yamlObj); err != nil {
		return "", fmt.Errorf("YAML 解析失败: %v", err)
	}

	// 将 YAML 对象转换为 JSON
	jsonBytes, err := json.MarshalIndent(yamlObj, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON 转换失败: %v", err)
	}

	return string(jsonBytes), nil
}
