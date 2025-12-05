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
	// ThemeConfigFile 主题配置文件名称
	ThemeConfigFile = "theme.json"
	// ConfigFileMode 配置文件权限
	ConfigFileMode = 0644
	// ConfigDirMode 配置目录权限
	ConfigDirMode = 0755
)

// Config 主题配置
type Config struct {
	Theme string `json:"theme"`
}

// ConfigManager 配置管理器
type ConfigManager struct {
	config *Config
	mu     sync.RWMutex
}

// NewConfigManager 创建新的配置管理器实例
func NewConfigManager() *ConfigManager {
	cm := &ConfigManager{
		config: &Config{
			Theme: DefaultTheme,
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
	configDirPath := filepath.Join(homeDir, ConfigDir)
	configFilePath := filepath.Join(configDirPath, ThemeConfigFile)
	return configFilePath, nil
}

// Load 从文件加载配置
func (cm *ConfigManager) Load() error {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	configFilePath, err := cm.getConfigPath()
	if err != nil {
		// 如果获取路径失败，使用默认配置
		cm.config.Theme = DefaultTheme
		return nil
	}

	// 检查配置文件是否存在
	_, err = os.Stat(configFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			// 配置文件不存在，使用默认配置（这是正常情况）
			cm.config.Theme = DefaultTheme
			return nil
		}
		cm.config.Theme = DefaultTheme
		return errors.WithStack(err)
	}

	// 读取配置文件
	data, err := os.ReadFile(configFilePath)
	if err != nil {
		cm.config.Theme = DefaultTheme
		return errors.WithStack(err)
	}

	// 解析JSON
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		cm.config.Theme = DefaultTheme
		return errors.WithStack(err)
	}

	// 验证并设置主题值
	cm.config.Theme = ValidateTheme(config.Theme)
	return nil
}

// Save 保存配置到文件
func (cm *ConfigManager) Save(theme string) error {
	validTheme := ValidateTheme(theme)

	cm.mu.Lock()
	defer cm.mu.Unlock()

	configFilePath, err := cm.getConfigPath()
	if err != nil {
		return errors.WithStack(err)
	}

	configDirPath := filepath.Dir(configFilePath)
	// 确保配置目录存在
	if err := os.MkdirAll(configDirPath, ConfigDirMode); err != nil {
		return errors.WithStack(err)
	}

	// 准备配置数据
	config := Config{
		Theme: validTheme,
	}

	// 序列化为JSON
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return errors.WithStack(err)
	}

	// 写入文件
	if err := os.WriteFile(configFilePath, data, ConfigFileMode); err != nil {
		return errors.WithStack(err)
	}

	// 更新内存中的主题值
	cm.config.Theme = validTheme

	return nil
}

// GetTheme 获取当前主题
func (cm *ConfigManager) GetTheme() string {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	if cm.config.Theme == "" {
		return DefaultTheme
	}
	return cm.config.Theme
}
