package app

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/logger"
)

// SlogAdapter 适配 slog.Logger 到 Wails logger.Logger 接口
type SlogAdapter struct {
	logger *slog.Logger
}

// Print 打印消息
func (a *SlogAdapter) Print(message string) {
	a.logger.Info(message)
}

// Trace 跟踪级别日志
func (a *SlogAdapter) Trace(message string) {
	a.logger.Debug(message)
}

// Debug 调试级别日志
func (a *SlogAdapter) Debug(message string) {
	a.logger.Debug(message)
}

// Info 信息级别日志
func (a *SlogAdapter) Info(message string) {
	a.logger.Info(message)
}

// Warning 警告级别日志
func (a *SlogAdapter) Warning(message string) {
	a.logger.Warn(message)
}

// Error 错误级别日志
func (a *SlogAdapter) Error(message string) {
	a.logger.Error(message)
}

// Fatal 致命错误级别日志
func (a *SlogAdapter) Fatal(message string) {
	a.logger.Error(message)
	os.Exit(1)
}

// CreateLogger 创建 slog Logger，使用 JSONHandler 输出到文件
func CreateLogger() (logger.Logger, error) {
	// 获取用户主目录
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("获取用户主目录失败: %w", err)
	}

	// 创建日志目录
	logDir := filepath.Join(homeDir, ".dev-tools", "logs")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("创建日志目录失败: %w", err)
	}

	// 日志文件路径
	logFile := filepath.Join(logDir, "app.log")

	// 打开日志文件（追加模式）
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("打开日志文件失败: %w", err)
	}

	// 创建 JSON Handler
	handler := slog.NewJSONHandler(file, &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: true,
	})

	// 创建 Logger
	slogLogger := slog.New(handler)

	// 返回适配器
	return &SlogAdapter{logger: slogLogger}, nil
}
