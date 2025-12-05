package application

import (
	"github.com/cyrnicolase/dev-tools/internal/theme/domain"
)

// Service 主题服务
type Service struct {
	configManager *domain.ConfigManager
}

// NewService 创建新的主题服务实例
func NewService() *Service {
	return &Service{
		configManager: domain.NewConfigManager(),
	}
}

// GetTheme 获取当前主题
func (s *Service) GetTheme() string {
	return s.configManager.GetTheme()
}

// SetTheme 设置主题并保存
func (s *Service) SetTheme(theme string) error {
	return s.configManager.Save(theme)
}

// LoadTheme 加载主题配置
func (s *Service) LoadTheme() error {
	return s.configManager.Load()
}
