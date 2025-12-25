package interfaces

import (
	"github.com/cyrnicolase/dev-tools/internal/hash/application"
)

// API 散列值计算工具 API
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// HashText 计算文本的散列值
func (a *API) HashText(algorithm, text string) (string, error) {
	return a.service.HashText(algorithm, text)
}

// HashFile 计算文件的散列值
func (a *API) HashFile(algorithm string, fileData []byte) (string, error) {
	return a.service.HashFile(algorithm, fileData)
}

