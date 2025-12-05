package domain

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"github.com/pkg/errors"
)

const (
	// ConfigDir 配置目录名称
	ConfigDir = ".dev-tools"
	// TranslateConfigFile 翻译工具配置文件名称
	TranslateConfigFile = "translate.json"
	// DefaultProvider 默认翻译提供商
	DefaultProvider = ProviderYoudao
	// ConfigFileMode 配置文件权限
	ConfigFileMode = 0644
	// ConfigDirMode 配置目录权限
	ConfigDirMode = 0755
)

const (
	configDir       = ConfigDir
	configFile      = TranslateConfigFile
	defaultProvider = DefaultProvider
)

// Config 翻译工具配置
type Config struct {
	DefaultProvider string                    `json:"defaultProvider"`
	Providers       map[string]ProviderConfig `json:"providers"`
}

// ProviderConfig 提供商配置
type ProviderConfig map[string]string

// ConfigManager 配置管理器
type ConfigManager struct {
	config *Config
	mu     sync.RWMutex
}

// NewConfigManager 创建新的配置管理器实例
func NewConfigManager() *ConfigManager {
	cm := &ConfigManager{
		config: &Config{
			DefaultProvider: defaultProvider,
			Providers:       make(map[string]ProviderConfig),
		},
	}
	// 加载配置
	_ = cm.Load()
	return cm
}

// getConfigPath 获取配置文件路径
func (cm *ConfigManager) getConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", errors.WithStack(err)
	}
	configDirPath := filepath.Join(homeDir, configDir)
	configFilePath := filepath.Join(configDirPath, configFile)
	return configFilePath, nil
}

// Load 从文件加载配置
func (cm *ConfigManager) Load() error {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	configFilePath, err := cm.getConfigPath()
	if err != nil {
		return errors.WithStack(err)
	}

	// 检查配置文件是否存在
	_, err = os.Stat(configFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			// 配置文件不存在，使用默认配置
			return nil
		}
		return errors.WithStack(err)
	}

	// 读取配置文件
	data, err := os.ReadFile(configFilePath)
	if err != nil {
		return errors.WithStack(err)
	}

	// 解析JSON
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return errors.WithStack(err)
	}

	// 验证默认提供商
	if !IsValidProvider(config.DefaultProvider) {
		config.DefaultProvider = defaultProvider
	}

	// 确保Providers不为nil
	if config.Providers == nil {
		config.Providers = make(map[string]ProviderConfig)
	}

	cm.config = &config
	return nil
}

// Save 保存配置到文件
// 注意：调用此方法前必须已经持有写锁（Lock），否则会死锁
func (cm *ConfigManager) Save() error {
	configFilePath, err := cm.getConfigPath()
	if err != nil {
		return errors.WithStack(err)
	}

	configDirPath := filepath.Dir(configFilePath)
	// 确保配置目录存在
	if err := os.MkdirAll(configDirPath, ConfigDirMode); err != nil {
		return errors.WithStack(err)
	}

	// 序列化为JSON
	data, err := json.MarshalIndent(cm.config, "", "  ")
	if err != nil {
		return errors.WithStack(err)
	}

	// 写入文件
	if err := os.WriteFile(configFilePath, data, ConfigFileMode); err != nil {
		return errors.WithStack(err)
	}

	return nil
}

// GetDefaultProvider 获取默认提供商
func (cm *ConfigManager) GetDefaultProvider() string {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	if cm.config.DefaultProvider == "" {
		return defaultProvider
	}
	return cm.config.DefaultProvider
}

// SetDefaultProvider 设置默认提供商
func (cm *ConfigManager) SetDefaultProvider(provider string) error {
	if !IsValidProvider(provider) {
		return errors.Wrapf(ErrInvalidProvider, "invalid provider: %s", provider)
	}
	cm.mu.Lock()
	defer cm.mu.Unlock()
	cm.config.DefaultProvider = provider
	return cm.Save()
}

// GetProviderConfig 获取提供商配置
func (cm *ConfigManager) GetProviderConfig(provider string) ProviderConfig {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	if cm.config.Providers == nil {
		return make(ProviderConfig)
	}
	config, exists := cm.config.Providers[provider]
	if !exists {
		return make(ProviderConfig)
	}
	// 返回副本，避免外部修改
	result := make(ProviderConfig)
	for k, v := range config {
		result[k] = v
	}
	return result
}

// SetProviderConfig 设置提供商配置
func (cm *ConfigManager) SetProviderConfig(provider string, config ProviderConfig) error {
	if !IsValidProvider(provider) {
		return errors.Wrapf(ErrInvalidProvider, "invalid provider: %s", provider)
	}
	cm.mu.Lock()
	defer cm.mu.Unlock()
	if cm.config.Providers == nil {
		cm.config.Providers = make(map[string]ProviderConfig)
	}
	cm.config.Providers[provider] = config
	return cm.Save()
}

// GetConfig 获取完整配置（用于JSON序列化）
func (cm *ConfigManager) GetConfig() *Config {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	// 返回副本
	configCopy := &Config{
		DefaultProvider: cm.config.DefaultProvider,
		Providers:       make(map[string]ProviderConfig),
	}
	for k, v := range cm.config.Providers {
		configCopy.Providers[k] = v
	}
	return configCopy
}
