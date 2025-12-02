package main

import (
	"embed"
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"

	"github.com/cyrnicolase/dev-tools/cmd/app"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// 检查版本号参数
	if checkVersionFlag() {
		return
	}

	appInstance := app.NewApp()

	// 在启动前先加载主题设置（用于设置窗口背景色）
	// 注意：这里需要手动加载主题，因为 Startup 回调在窗口创建后才执行
	appInstance.LoadThemeForStartup()

	// 解析命令行参数
	toolName := parseCommandLineArgs()
	if toolName != "" {
		appInstance.SetInitialTool(toolName)
	}

	// 获取当前主题，用于设置窗口背景色
	currentTheme := appInstance.GetTheme()
	var bgColor *options.RGBA
	if currentTheme == "dark" {
		// 深色主题背景色：对应 --bg-primary (#111827)
		bgColor = &options.RGBA{R: 17, G: 24, B: 39, A: 1}
	} else {
		// 浅色主题背景色：对应 --bg-primary (#f9fafb)
		bgColor = &options.RGBA{R: 249, G: 250, B: 251, A: 1}
	}

	// 创建菜单栏，保留系统默认菜单
	appMenu := menu.NewMenu()

	// 添加默认的应用菜单（macOS 上的应用菜单，包含关于、偏好设置等）
	appMenu.Append(menu.AppMenu())

	// 添加默认的编辑菜单（包含复制、粘贴、全选等）
	appMenu.Append(menu.EditMenu())

	// 添加默认的窗口菜单（包含最小化、缩放、全屏等）
	appMenu.Append(menu.WindowMenu())

	// 添加自定义的帮助菜单
	helpMenu := appMenu.AddSubmenu("Help")
	helpMenu.AddText("Usage", keys.CmdOrCtrl("i"), func(_ *menu.CallbackData) {
		appInstance.ShowHelp()
	})

	err := wails.Run(&options.App{
		Title:  "Dev Tools",
		Width:  1140,
		Height: 940,
		Menu:   appMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: bgColor,
		OnStartup:        appInstance.Startup,
		Mac: &mac.Options{
			OnUrlOpen: func(url string) {
				// 处理 URL Scheme 调用（应用已运行时）
				fmt.Fprintf(os.Stderr, "DEBUG: OnUrlOpen 接收到 URL: %s\n", url)
				toolName := parseURLScheme(url)
				if toolName != "" {
					fmt.Fprintf(os.Stderr, "DEBUG: OnUrlOpen 解析到工具: %s\n", toolName)
					appInstance.SetInitialTool(toolName)
				}
			},
		},
		Bind: []interface{}{
			appInstance,           // 应用级别功能（版本号、导航）
			appInstance.JSON,      // JSON 工具处理器
			appInstance.Base64,    // Base64 工具处理器
			appInstance.Timestamp, // Timestamp 工具处理器
			appInstance.UUID,      // UUID 工具处理器
			appInstance.URL,       // URL 工具处理器
			appInstance.QRCode,    // 二维码工具处理器
			appInstance.IPQuery,   // IP查询工具处理器
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

// parseCommandLineArgs 解析命令行参数
// 支持格式：
// - --tool <toolName>
// - <toolName> (直接作为第一个参数)
// - devtools://tool/<toolName> (URL Scheme)
func parseCommandLineArgs() string {
	args := os.Args[1:]
	if len(args) == 0 {
		return ""
	}

	// 检查 --tool 参数
	for i, arg := range args {
		if arg == "--tool" && i+1 < len(args) {
			toolName := args[i+1]
			return toolName
		}
	}

	// 检查是否是 URL Scheme 格式 (devtools://tool/<toolName>)
	if len(args) > 0 {
		arg := args[0]
		if strings.HasPrefix(arg, "devtools://") {
			toolName := parseURLScheme(arg)
			if toolName != "" {
				return toolName
			}
		}
		return arg
	}

	return ""
}

// parseURLScheme 解析 URL Scheme，提取工具名称
// 支持格式: devtools://tool/<toolName>
func parseURLScheme(url string) string {
	if !strings.HasPrefix(url, "devtools://") {
		return ""
	}

	// 移除协议前缀
	urlPath := strings.TrimPrefix(url, "devtools://")
	// 移除开头的斜杠（如果有）
	urlPath = strings.TrimPrefix(urlPath, "/")
	// 分割路径
	parts := strings.Split(urlPath, "/")

	// 解析格式: tool/<toolName>
	if len(parts) >= 2 && parts[0] == "tool" {
		toolName := strings.TrimSpace(parts[1])
		if toolName != "" {
			return toolName
		}
	}

	// 如果格式不对，尝试直接使用最后一个部分作为工具名称
	if len(parts) > 0 {
		lastPart := strings.TrimSpace(parts[len(parts)-1])
		if lastPart != "" && lastPart != "tool" {
			return lastPart
		}
	}

	return ""
}

// checkVersionFlag 检查是否请求显示版本号
// 支持 --version, -v, version 参数
func checkVersionFlag() bool {
	args := os.Args[1:]
	for _, arg := range args {
		arg = strings.ToLower(strings.TrimSpace(arg))
		if arg == "--version" || arg == "-v" || arg == "version" {
			fmt.Printf("Dev Tools %s\n", app.GetVersion())
			return true
		}
	}
	return false
}
