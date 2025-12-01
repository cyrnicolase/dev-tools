package interfaces

import (
	"encoding/json"

	"github.com/cyrnicolase/dev-tools/internal/ipquery/application"
	"github.com/cyrnicolase/dev-tools/internal/ipquery/domain"
)

// API IP查询工具 API 接口
type API struct {
	service *application.Service
}

// NewAPI 创建新的 API 实例
func NewAPI() *API {
	return &API{
		service: application.NewService(),
	}
}

// Query 查询IP地址，返回JSON格式的结果数组
func (a *API) Query(ip string) (string, error) {
	results, err := a.service.QueryIP(ip)
	if err != nil {
		return "", err
	}

	// 确保返回顺序：ip-api.com在前，ipinfo.io在后
	var orderedResults []domain.QueryResult
	for _, result := range results {
		if result.Source == "ip-api.com" {
			orderedResults = append(orderedResults, result)
		}
	}
	for _, result := range results {
		if result.Source == "ipinfo.io" {
			orderedResults = append(orderedResults, result)
		}
	}

	jsonData, err := json.Marshal(orderedResults)
	if err != nil {
		return "", err
	}

	return string(jsonData), nil
}

