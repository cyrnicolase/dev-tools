package main

import (
	"embed"
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

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

	// 解析命令行参数
	toolName := parseCommandLineArgs()
	if toolName != "" {
		appInstance.SetInitialTool(toolName)
	}

	err := wails.Run(&options.App{
		Title:  "Dev Tools",
		Width:  1140,
		Height: 940,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        appInstance.Startup,
		Bind: []interface{}{
			appInstance,           // 应用级别功能（版本号、导航）
			appInstance.JSON,      // JSON 工具处理器
			appInstance.Base64,    // Base64 工具处理器
			appInstance.Timestamp, // Timestamp 工具处理器
			appInstance.UUID,       // UUID 工具处理器
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
func parseCommandLineArgs() string {
	args := os.Args[1:]
	if len(args) == 0 {
		return ""
	}

	// 检查 --tool 参数
	for i, arg := range args {
		if arg == "--tool" && i+1 < len(args) {
			return args[i+1]
		}
	}

	// 检查是否是 URL Scheme 格式 (devtools://tool/<toolName>)
	if len(args) > 0 {
		arg := args[0]
		if strings.HasPrefix(arg, "devtools://") {
			// 解析 URL Scheme: devtools://tool/<toolName>
			parts := strings.Split(strings.TrimPrefix(arg, "devtools://"), "/")
			if len(parts) >= 2 && parts[0] == "tool" {
				return parts[1]
			}
		}
		// 直接作为工具名称（简单情况）
		return arg
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
