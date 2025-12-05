package providers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/cyrnicolase/dev-tools/internal/translate/domain"
	"github.com/pkg/errors"
)

// 有道翻译API相关常量
const (
	// YoudaoAPIURL 有道翻译API地址
	YoudaoAPIURL = "https://openapi.youdao.com/api"
	// defaultHTTPTimeout 默认HTTP请求超时时间
	defaultHTTPTimeout = 10 * time.Second
	// YoudaoAPITextMaxLength 有道翻译API签名计算时文本最大长度
	YoudaoAPITextMaxLength = 20
	// YoudaoAPITextPrefixLength 超过最大长度时，使用前N个字符
	YoudaoAPITextPrefixLength = 10
	// YoudaoAPITextSuffixLength 超过最大长度时，使用后N个字符
	YoudaoAPITextSuffixLength = 10
)

// YoudaoProvider 有道翻译提供商
type YoudaoProvider struct {
	appKey    string
	appSecret string
	client    *youdaoClient
}

// NewYoudaoProvider 创建有道翻译提供商实例
func NewYoudaoProvider(appKey, appSecret string) *YoudaoProvider {
	return &YoudaoProvider{
		appKey:    appKey,
		appSecret: appSecret,
		client:    newYoudaoClient(),
	}
}

// GetName 获取提供商名称
func (p *YoudaoProvider) GetName() string {
	return "有道翻译"
}

// GetSupportedLanguages 获取支持的语言列表
func (p *YoudaoProvider) GetSupportedLanguages() []string {
	return domain.SupportedLanguages
}

// Translate 翻译文本
func (p *YoudaoProvider) Translate(text, from, to string) (string, error) {
	// 验证语言代码
	if !domain.IsValidLanguagePair(from, to) {
		return "", errors.Wrapf(domain.ErrInvalidLanguagePair, "invalid language pair: %s -> %s", from, to)
	}

	// 转换为有道API语言代码
	fromCode := domain.ConvertToProviderCode(from, domain.ProviderYoudao)
	toCode := domain.ConvertToProviderCode(to, domain.ProviderYoudao)

	// 验证配置
	if p.appKey == "" || p.appSecret == "" {
		return "", errors.WithStack(domain.ErrYoudaoAPIKeyNotConfigured)
	}

	// 计算签名
	sign, salt, curtime := calculateYoudaoSignature(p.appKey, text, p.appSecret)

	// 构建请求
	req := &translateRequest{
		Text:     text,
		FromCode: fromCode,
		ToCode:   toCode,
		AppKey:   p.appKey,
		Salt:     salt,
		Sign:     sign,
		Curtime:  curtime,
	}

	// 发送请求
	resp, err := p.client.doTranslate(req)
	if err != nil {
		return "", errors.WithStack(err)
	}

	// 检查错误码
	if resp.ErrorCode != "0" {
		return "", errors.Wrapf(domain.ErrYoudaoTranslationFailed, "%s", getYoudaoErrorMessage(resp.ErrorCode))
	}

	// 提取翻译结果
	if len(resp.Translation) == 0 {
		return "", errors.WithStack(domain.ErrEmptyTranslationResult)
	}

	return resp.Translation[0], nil
}

// youdaoClient 有道翻译API客户端（内部使用）
type youdaoClient struct {
	httpClient *http.Client
}

// newYoudaoClient 创建有道翻译API客户端
func newYoudaoClient() *youdaoClient {
	return &youdaoClient{
		httpClient: &http.Client{
			Timeout: defaultHTTPTimeout,
		},
	}
}

// translateRequest 翻译请求参数（内部使用）
type translateRequest struct {
	Text     string
	FromCode string
	ToCode   string
	AppKey   string
	Salt     string
	Sign     string
	Curtime  string
}

// translateResponse 翻译响应（内部使用）
type translateResponse struct {
	ErrorCode   string   `json:"errorCode"`
	Query       string   `json:"query"`
	Translation []string `json:"translation"`
}

// doTranslate 执行翻译请求
func (c *youdaoClient) doTranslate(req *translateRequest) (*translateResponse, error) {
	// 构建请求参数
	params := url.Values{}
	params.Set("q", req.Text)
	params.Set("from", req.FromCode)
	params.Set("to", req.ToCode)
	params.Set("appKey", req.AppKey)
	params.Set("salt", req.Salt)
	params.Set("sign", req.Sign)
	params.Set("signType", "v3")
	params.Set("curtime", req.Curtime)

	// 创建HTTP请求
	httpReq, err := http.NewRequest("POST", YoudaoAPIURL, nil)
	if err != nil {
		return nil, errors.WithStack(errors.Wrap(err, "创建HTTP请求失败"))
	}
	httpReq.URL.RawQuery = params.Encode()
	httpReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// 发送请求
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, errors.WithStack(errors.Wrap(err, "网络请求失败"))
	}
	defer resp.Body.Close()

	// 检查HTTP状态码
	if resp.StatusCode != http.StatusOK {
		return nil, errors.Wrapf(domain.ErrYoudaoHTTPError, "HTTP status code: %d", resp.StatusCode)
	}

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.WithStack(errors.Wrap(err, "读取响应失败"))
	}

	// 解析响应
	var apiResp translateResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, errors.WithStack(errors.Wrap(err, "解析响应失败"))
	}

	return &apiResp, nil
}

// calculateYoudaoSignature 计算有道翻译API签名
// 签名规则：sign=sha256(appKey + input + salt + curtime + appSecret)
// 其中input处理规则：
//   - 如果文本长度 <= 20，直接使用原文本
//   - 如果文本长度 > 20，使用：前10个字符 + 文本长度 + 后10个字符
func calculateYoudaoSignature(appKey, text, appSecret string) (sign, salt, curtime string) {
	// 生成随机数（salt）和当前时间戳（curtime）
	timestamp := time.Now().Unix()
	salt = strconv.FormatInt(timestamp, 10)
	curtime = strconv.FormatInt(timestamp, 10)

	// 处理待翻译文本（用于签名计算）
	signText := processTextForSignature(text)

	// 生成签名：sign=sha256(appKey + input + salt + curtime + appSecret)
	signStr := appKey + signText + salt + curtime + appSecret
	hash := sha256.Sum256([]byte(signStr))
	sign = hex.EncodeToString(hash[:])

	return sign, salt, curtime
}

// processTextForSignature 处理文本用于签名计算
// 如果文本长度超过20，需要特殊处理：前10个字符 + 长度 + 后10个字符
func processTextForSignature(text string) string {
	runes := []rune(text)
	if len(runes) <= YoudaoAPITextMaxLength {
		return text
	}

	length := len(runes)
	prefix := string(runes[:YoudaoAPITextPrefixLength])
	suffix := string(runes[length-YoudaoAPITextSuffixLength:])
	return prefix + strconv.Itoa(length) + suffix
}

// getYoudaoErrorMessage 获取有道翻译错误信息
func getYoudaoErrorMessage(errorCode string) string {
	errorMessages := map[string]string{
		"101": "缺少必填参数",
		"102": "不支持的语言类型",
		"103": "翻译文本过长",
		"104": "不支持的API类型",
		"105": "不支持的签名类型",
		"106": "不支持的响应类型",
		"107": "不支持的传输加密类型",
		"108": "appKey无效",
		"109": "batchLog格式不正确",
		"110": "无相关服务的有效实例",
		"201": "解密失败",
		"202": "签名检验失败",
		"203": "访问IP地址不在可访问IP列表",
		"205": "请求的接口与应用的平台类型不一致",
		"206": "因为时间戳超时，请求失效",
		"207": "重放请求",
		"301": "辞典查询失败",
		"302": "翻译查询失败",
		"303": "服务端的其他异常",
		"401": "账户已经欠费",
		"411": "访问频率受限",
		"412": "长请求超过限制",
	}

	if msg, ok := errorMessages[errorCode]; ok {
		return msg
	}
	return fmt.Sprintf("未知错误: %s", errorCode)
}
