package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

// Logger 日志记录器
type Logger struct {
	file   *os.File
	mu     sync.Mutex
	logDir string
}

var (
	globalLogger *Logger
	once         sync.Once
)

// InitLogger 初始化全局日志记录器
func InitLogger(logDir string) error {
	var err error
	once.Do(func() {
		globalLogger, err = NewLogger(logDir)
	})
	return err
}

// NewLogger 创建新的日志记录器
func NewLogger(logDir string) (*Logger, error) {
	// 确保日志目录存在
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("创建日志目录失败: %v", err)
	}

	// 创建日志文件（按日期命名）
	logFile := filepath.Join(logDir, fmt.Sprintf("error_%s.log", time.Now().Format("2006-01-02")))
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("打开日志文件失败: %v", err)
	}

	return &Logger{
		file:   file,
		logDir: logDir,
	}, nil
}

// MustGetLogger 获取全局日志记录器
func MustGetLogger() *Logger {
	if globalLogger == nil {
		panic("logger not initialized")
	}
	return globalLogger
}

// LogError 记录错误日志（带堆栈信息）
func (l *Logger) LogError(handler, method string, err error) {
	if l == nil || err == nil {
		return
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	// 获取调用栈信息
	stack := l.getStackTrace()

	// 格式化日志
	timestamp := time.Now().Format("2006-01-02 15:04:05.000")
	logMsg := fmt.Sprintf("[%s] [ERROR] [%s.%s] %v\n%s\n",
		timestamp, handler, method, err, stack)

	// 写入文件
	_, _ = l.file.WriteString(logMsg)
	_ = l.file.Sync()
}

// getStackTrace 获取调用栈信息
func (l *Logger) getStackTrace() string {
	// 获取调用栈，跳过 logger 本身的调用（前 3 层）
	pc := make([]uintptr, 20)
	n := runtime.Callers(3, pc)
	if n == 0 {
		return "  (无调用栈信息)"
	}

	frames := runtime.CallersFrames(pc[:n])
	var stack strings.Builder
	stack.WriteString("调用栈:\n")

	count := 0
	for {
		frame, more := frames.Next()
		if !more {
			break
		}

		// 跳过 runtime 相关的调用
		if strings.Contains(frame.Function, "runtime.") {
			continue
		}

		// 格式化调用栈信息
		file := filepath.Base(frame.File)
		stack.WriteString(fmt.Sprintf("  %s\n    %s:%d\n", frame.Function, file, frame.Line))

		count++
		// 最多保留 15 层调用栈
		if count >= 15 {
			break
		}
	}

	return stack.String()
}
