package application

import (
	historydomain "github.com/cyrnicolase/dev-tools/internal/history/domain"
	"github.com/cyrnicolase/dev-tools/internal/translate/domain"
	"github.com/cyrnicolase/dev-tools/internal/translate/domain/providers"
	"github.com/pkg/errors"
)

// Service 翻译服务
type Service struct {
	configManager  *domain.ConfigManager
	historyStore   *historydomain.ToolHistoryStore
	historyInitErr error
}

const translateToolID = "translate"

// NewService 创建新的翻译服务实例
func NewService() *Service {
	historyStore, historyErr := historydomain.NewToolHistoryStore()
	return &Service{
		configManager:  domain.NewConfigManager(),
		historyStore:   historyStore,
		historyInitErr: historyErr,
	}
}

// Translate 翻译文本
func (s *Service) Translate(text, from, to string) (string, error) {
	// 验证输入
	if text == "" {
		return "", errors.WithStack(domain.ErrEmptyTranslateText)
	}

	if !domain.IsValidLanguagePair(from, to) {
		return "", errors.Wrapf(domain.ErrInvalidLanguagePair, "invalid language pair: %s -> %s", from, to)
	}

	// 获取默认提供商
	providerType := s.configManager.GetDefaultProvider()

	// 获取提供商配置
	config := s.configManager.GetProviderConfig(providerType)

	// 创建提供商实例
	provider, err := providers.NewProvider(providerType, config)
	if err != nil {
		return "", err
	}

	// 执行翻译
	result, err := provider.Translate(text, from, to)
	if err != nil {
		return "", err
	}

	return result, nil
}

// GetDefaultProvider 获取默认提供商
func (s *Service) GetDefaultProvider() string {
	return s.configManager.GetDefaultProvider()
}

// SetDefaultProvider 设置默认提供商
func (s *Service) SetDefaultProvider(provider string) error {
	return s.configManager.SetDefaultProvider(provider)
}

// GetProviderConfig 获取提供商配置
func (s *Service) GetProviderConfig(provider string) (domain.ProviderConfig, error) {
	if !domain.IsValidProvider(provider) {
		return nil, errors.Wrapf(domain.ErrInvalidProvider, "invalid provider: %s", provider)
	}
	return s.configManager.GetProviderConfig(provider), nil
}

// SaveProviderConfig 保存提供商配置
func (s *Service) SaveProviderConfig(provider string, config domain.ProviderConfig) error {
	if !domain.IsValidProvider(provider) {
		return errors.Wrapf(domain.ErrInvalidProvider, "invalid provider: %s", provider)
	}
	return s.configManager.SetProviderConfig(provider, config)
}

// GetSupportedProviders 获取支持的提供商列表
func (s *Service) GetSupportedProviders() []string {
	return domain.SupportedProviders
}

// ListHistory 获取历史记录
func (s *Service) ListHistory() ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	return s.historyStore.List(translateToolID)
}

// AddHistory 添加历史记录
func (s *Service) AddHistory(record historydomain.ToolHistoryRecord) ([]historydomain.ToolHistoryRecord, error) {
	if s.historyInitErr != nil || s.historyStore == nil {
		return nil, s.historyUnavailableError()
	}
	record.ToolID = translateToolID
	return s.historyStore.Add(record)
}

// ClearHistory 清空历史记录
func (s *Service) ClearHistory() error {
	if s.historyInitErr != nil || s.historyStore == nil {
		return s.historyUnavailableError()
	}
	return s.historyStore.Clear(translateToolID)
}

func (s *Service) historyUnavailableError() error {
	if s.historyInitErr != nil {
		return s.historyInitErr
	}
	return errors.WithStack(historydomain.ErrHistoryStoreUnavailable)
}
