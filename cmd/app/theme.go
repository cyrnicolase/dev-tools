package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"github.com/cyrnicolase/dev-tools/internal/logger"
	"github.com/pkg/errors"
)

const (
	defaultTheme = "light"
	configDir    = ".dev-tools"
	configFile   = "theme.json"
)

// ThemeManager 主题管理器
type ThemeManager struct {
	theme   string
	themeMu sync.RWMutex
}

// NewThemeManager 创建新的主题管理器实例
// 如果加载主题失败，使用默认主题，不影响创建
func NewThemeManager() *ThemeManager {
	tm := &ThemeManager{
		theme: defaultTheme,
	}
	// 创建时立即加载主题设置
	// 如果加载失败，使用默认主题（已在初始化时设置）
	if err := tm.Load(); err != nil {
		logger.GetLogger().LogError("ThemeManager", "NewThemeManager", err)
	}
	return tm
}

// getConfigPath 获取主题配置文件路径
func (tm *ThemeManager) getConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	configDirPath := filepath.Join(homeDir, configDir)
	configFilePath := filepath.Join(configDirPath, configFile)
	return configFilePath, nil
}

// validateTheme 验证主题值
func (tm *ThemeManager) validateTheme(theme string) string {
	if theme != "light" && theme != "dark" {
		return defaultTheme
	}
	return theme
}

// setThemeUnsafe 设置主题（不加锁，内部使用）
func (tm *ThemeManager) setThemeUnsafe(theme string) {
	tm.theme = theme
}

// setTheme 设置主题（加锁）
func (tm *ThemeManager) setTheme(theme string) {
	tm.themeMu.Lock()
	defer tm.themeMu.Unlock()
	tm.setThemeUnsafe(theme)
}

// Load 从文件加载主题设置
// 如果配置文件不存在，使用默认主题并返回 nil
// 如果发生其他错误（如权限错误、JSON 解析错误），返回错误
func (tm *ThemeManager) Load() error {
	configFilePath, err := tm.getConfigPath()
	if err != nil {
		tm.setTheme(defaultTheme)
		return nil
	}

	// 检查配置文件是否存在
	_, err = os.Stat(configFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			// 配置文件不存在，使用默认主题（这是正常情况）
			tm.setTheme(defaultTheme)
			return nil
		}
		tm.setTheme(defaultTheme)
		return errors.WithStack(err)
	}

	// 读取配置文件
	data, err := os.ReadFile(configFilePath)
	if err != nil {
		// 读取文件失败，首次错误使用 WithStack 包装
		tm.setTheme(defaultTheme)
		return errors.WithStack(err)
	}

	// 解析JSON
	var config struct {
		Theme string `json:"theme"`
	}
	if err := json.Unmarshal(data, &config); err != nil {
		// JSON 解析失败，首次错误使用 WithStack 包装
		tm.setTheme(defaultTheme)
		return errors.WithStack(err)
	}

	// 验证并设置主题值
	validTheme := tm.validateTheme(config.Theme)
	tm.setTheme(validTheme)
	return nil
}

// Save 保存主题设置到文件
func (tm *ThemeManager) Save(theme string) error {
	validTheme := tm.validateTheme(theme)
	if validTheme == "" {
		validTheme = defaultTheme
	}

	configFilePath, err := tm.getConfigPath()
	if err != nil {
		// 首次错误使用 WithStack 包装
		return errors.WithStack(err)
	}

	configDirPath := filepath.Dir(configFilePath)
	// 确保配置目录存在
	if err := os.MkdirAll(configDirPath, 0755); err != nil {
		// 首次错误使用 WithStack 包装
		return errors.WithStack(err)
	}

	// 准备配置数据
	config := struct {
		Theme string `json:"theme"`
	}{
		Theme: validTheme,
	}

	// 序列化为JSON
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		// 首次错误使用 WithStack 包装
		return errors.WithStack(err)
	}

	// 写入文件
	if err := os.WriteFile(configFilePath, data, 0644); err != nil {
		// 首次错误使用 WithStack 包装
		return errors.WithStack(err)
	}

	// 更新内存中的主题值
	tm.setTheme(validTheme)

	return nil
}

// Get 获取当前主题
func (tm *ThemeManager) Get() string {
	tm.themeMu.RLock()
	defer tm.themeMu.RUnlock()
	if tm.theme == "" {
		return defaultTheme
	}
	return tm.theme
}

// Set 设置主题（不保存到文件，仅更新内存）
func (tm *ThemeManager) Set(theme string) {
	validTheme := tm.validateTheme(theme)
	tm.setTheme(validTheme)
}
