package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
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
func NewThemeManager() *ThemeManager {
	tm := &ThemeManager{
		theme: defaultTheme,
	}
	// 创建时立即加载主题设置
	tm.Load()
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

// Load 从文件加载主题设置
func (tm *ThemeManager) Load() {
	configFilePath, err := tm.getConfigPath()
	if err != nil {
		tm.themeMu.Lock()
		tm.theme = defaultTheme
		tm.themeMu.Unlock()
		return
	}

	// 如果配置文件不存在，使用默认主题
	if _, err := os.Stat(configFilePath); os.IsNotExist(err) {
		tm.themeMu.Lock()
		tm.theme = defaultTheme
		tm.themeMu.Unlock()
		return
	}

	// 读取配置文件
	data, err := os.ReadFile(configFilePath)
	if err != nil {
		tm.themeMu.Lock()
		tm.theme = defaultTheme
		tm.themeMu.Unlock()
		return
	}

	// 解析JSON
	var config struct {
		Theme string `json:"theme"`
	}
	if err := json.Unmarshal(data, &config); err != nil {
		tm.themeMu.Lock()
		tm.theme = defaultTheme
		tm.themeMu.Unlock()
		return
	}

	// 验证并设置主题值
	validTheme := tm.validateTheme(config.Theme)
	tm.themeMu.Lock()
	tm.theme = validTheme
	tm.themeMu.Unlock()
}

// Save 保存主题设置到文件
func (tm *ThemeManager) Save(theme string) error {
	validTheme := tm.validateTheme(theme)
	if validTheme == "" {
		validTheme = defaultTheme
	}

	configFilePath, err := tm.getConfigPath()
	if err != nil {
		return err
	}

	configDirPath := filepath.Dir(configFilePath)
	// 确保配置目录存在
	if err := os.MkdirAll(configDirPath, 0755); err != nil {
		return err
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
		return err
	}

	// 写入文件
	if err := os.WriteFile(configFilePath, data, 0644); err != nil {
		return err
	}

	// 更新内存中的主题值
	tm.themeMu.Lock()
	tm.theme = validTheme
	tm.themeMu.Unlock()

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
	tm.themeMu.Lock()
	tm.theme = validTheme
	tm.themeMu.Unlock()
}
