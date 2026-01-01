package domain

import (
	"crypto/rand"
	"math/big"

	"github.com/pkg/errors"
)

// Generator 提供随机字符串生成功能
type Generator struct {
	numbers    string
	lowercase  string
	uppercase  string
	special    string
}

// NewGenerator 创建新的 Generator 实例
func NewGenerator() *Generator {
	return &Generator{
		numbers:   "0123456789",
		lowercase: "abcdefghijklmnopqrstuvwxyz",
		uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		special:   "!@#$%^&*()_+-=[]{}|;:,.<>?",
	}
}

// Generate 生成单个随机字符串
func (g *Generator) Generate(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool) (string, error) {
	// 验证长度
	if length < 1 || length > 100 {
		return "", ErrInvalidLength
	}

	// 构建字符集
	charSet := g.buildCharSet(includeNumbers, includeLowercase, includeUppercase, includeSpecial)
	if len(charSet) == 0 {
		return "", ErrNoCharTypeSelected
	}

	// 生成随机字符串
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		idx, err := rand.Int(rand.Reader, big.NewInt(int64(len(charSet))))
		if err != nil {
			return "", errors.WithStack(err)
		}
		result[i] = charSet[idx.Int64()]
	}

	return string(result), nil
}

// GenerateBatch 批量生成随机字符串
func (g *Generator) GenerateBatch(length int, includeNumbers, includeLowercase, includeUppercase, includeSpecial bool, count int) ([]string, error) {
	// 验证参数
	if length < 1 || length > 100 {
		return nil, ErrInvalidLength
	}
	if count < 1 {
		count = 1
	}
	if count > 100 {
		count = 100 // 限制最大数量
	}

	// 构建字符集
	charSet := g.buildCharSet(includeNumbers, includeLowercase, includeUppercase, includeSpecial)
	if len(charSet) == 0 {
		return nil, ErrNoCharTypeSelected
	}

	// 批量生成
	results := make([]string, 0, count)
	for i := 0; i < count; i++ {
		str, err := g.Generate(length, includeNumbers, includeLowercase, includeUppercase, includeSpecial)
		if err != nil {
			return nil, err
		}
		results = append(results, str)
	}

	return results, nil
}

// buildCharSet 根据选择的字符类型构建字符集
func (g *Generator) buildCharSet(includeNumbers, includeLowercase, includeUppercase, includeSpecial bool) string {
	var charSet string
	if includeNumbers {
		charSet += g.numbers
	}
	if includeLowercase {
		charSet += g.lowercase
	}
	if includeUppercase {
		charSet += g.uppercase
	}
	if includeSpecial {
		charSet += g.special
	}
	return charSet
}

