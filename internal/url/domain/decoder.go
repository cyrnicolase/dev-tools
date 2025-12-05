package domain

import (
	"net/url"

	"github.com/pkg/errors"
)

// Decoder 提供 URL 解码功能
type Decoder struct{}

// NewDecoder 创建新的 Decoder 实例
func NewDecoder() *Decoder {
	return &Decoder{}
}

// Decode 将 URL 编码的字符串解码
func (d *Decoder) Decode(input string) (string, error) {
	decoded, err := url.QueryUnescape(input)
	if err != nil {
		return "", errors.Wrapf(err, "failed to decode URL")
	}
	return decoded, nil
}

