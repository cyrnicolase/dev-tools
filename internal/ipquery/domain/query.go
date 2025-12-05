package domain

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"

	"github.com/pkg/errors"
)

// QueryResult IP查询结果
type QueryResult struct {
	Source string `json:"source"`
	Status string `json:"status"` // "success" or "error"
	Country string `json:"country,omitempty"`
	Region  string `json:"region,omitempty"`
	City    string `json:"city,omitempty"`
	Error   string `json:"error,omitempty"`
}

// IPAPIResponse ip-api.com的响应结构
type IPAPIResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message,omitempty"`
	Country   string `json:"country,omitempty"`
	RegionName string `json:"regionName,omitempty"`
	City      string `json:"city,omitempty"`
}

// IPInfoResponse ipinfo.io的响应结构
type IPInfoResponse struct {
	Country string `json:"country,omitempty"`
	Region  string `json:"region,omitempty"`
	City    string `json:"city,omitempty"`
	Error   string `json:"error,omitempty"`
}

// Queryer IP查询器
type Queryer struct {
	httpClient *http.Client
}

// NewQueryer 创建新的查询器实例
func NewQueryer() *Queryer {
	return &Queryer{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// ValidateIP 验证IP地址格式
func (q *Queryer) ValidateIP(ip string) error {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return errors.Wrapf(ErrInvalidIPFormat, "invalid IP address: %s", ip)
	}
	return nil
}

// QueryIPAPI 查询ip-api.com
func (q *Queryer) QueryIPAPI(ip string) QueryResult {
	result := QueryResult{
		Source: "ip-api.com",
		Status: "error",
	}

	// 验证IP地址
	if err := q.ValidateIP(ip); err != nil {
		result.Error = err.Error()
		return result
	}

	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,message,country,regionName,city", ip)
	body, err := q.doHTTPRequest(url)
	if err != nil {
		result.Error = err.Error()
		return result
	}

	var apiResp IPAPIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		result.Error = errors.Wrapf(ErrParseJSONFailed, "failed to parse JSON: %v", err).Error()
		return result
	}

	if apiResp.Status == "fail" {
		result.Error = apiResp.Message
		return result
	}

	result.Status = "success"
	result.Country = apiResp.Country
	result.Region = apiResp.RegionName
	result.City = apiResp.City
	return result
}

// QueryIPInfo 查询ipinfo.io
func (q *Queryer) QueryIPInfo(ip string) QueryResult {
	result := QueryResult{
		Source: "ipinfo.io",
		Status: "error",
	}

	// 验证IP地址
	if err := q.ValidateIP(ip); err != nil {
		result.Error = err.Error()
		return result
	}

	url := fmt.Sprintf("https://ipinfo.io/%s/json", ip)
	body, err := q.doHTTPRequest(url)
	if err != nil {
		result.Error = err.Error()
		return result
	}

	var apiResp IPInfoResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		result.Error = errors.Wrapf(ErrParseJSONFailed, "failed to parse JSON: %v", err).Error()
		return result
	}

	// 检查是否有错误字段
	if apiResp.Error != "" {
		result.Error = apiResp.Error
		return result
	}

	result.Status = "success"
	result.Country = apiResp.Country
	result.Region = apiResp.Region
	result.City = apiResp.City
	return result
}

// doHTTPRequest 执行HTTP GET请求并返回响应体
func (q *Queryer) doHTTPRequest(url string) ([]byte, error) {
	resp, err := q.httpClient.Get(url)
	if err != nil {
		return nil, errors.Wrapf(ErrHTTPRequestFailed, "request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.Wrapf(ErrHTTPStatusError, "HTTP status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrapf(ErrReadResponseFailed, "failed to read response: %v", err)
	}

	return body, nil
}

