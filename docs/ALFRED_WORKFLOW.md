# Alfred 工作流配置指南

本文档说明如何配置 Alfred 工作流，以便通过 Alfred 快速启动 Dev Tools 应用并跳转到指定工具页面。

## 功能说明

Dev Tools 应用支持两种调用方式：
1. **命令行参数**：通过 `--tool <toolName>` 或直接 `<toolName>` 参数
2. **URL Scheme**：通过 `devtools://tool/<toolName>` URL Scheme（在 macOS 上，URL Scheme 会作为命令行参数传递）

**注意**：应用已运行时，URL Scheme 调用会传递给已运行的实例，但需要应用支持单实例模式。当前实现会在应用启动时读取命令行参数并切换到指定工具。如果应用已运行，可能需要手动激活窗口。

## 工具名称映射

- `json` -> JSON 工具
- `base64` -> Base64 工具
- `timestamp` -> 时间戳工具
- `uuid` -> UUID 工具

## 配置步骤

### 方法一：使用 URL Scheme（推荐）

1. 打开 Alfred Preferences（Alfred 偏好设置）
2. 进入 "Workflows"（工作流）标签
3. 点击左下角的 "+" 按钮，选择 "Blank Workflow"（空白工作流）
4. 设置工作流名称：`Dev Tools`
5. 添加 "Keyword"（关键字）触发器：
   - Keyword: `dt`
   - Argument: Required
   - Placeholder: `工具名称 (json/base64/timestamp/uuid)`
6. 连接 "Run Script"（运行脚本）操作：
   - Language: `/bin/bash`
   - Script:
   ```bash
   # 获取工具名称参数
   TOOL_NAME="$1"
   
   # 验证工具名称
   case "$TOOL_NAME" in
     json|base64|timestamp|uuid)
       # 使用 URL Scheme 打开应用
       open "devtools://tool/$TOOL_NAME"
       ;;
     *)
       echo "无效的工具名称: $TOOL_NAME"
       echo "可用工具: json, base64, timestamp, uuid"
       exit 1
       ;;
   esac
   ```
7. 保存工作流

### 方法二：使用命令行参数

1. 打开 Alfred Preferences（Alfred 偏好设置）
2. 进入 "Workflows"（工作流）标签
3. 点击左下角的 "+" 按钮，选择 "Blank Workflow"（空白工作流）
4. 设置工作流名称：`Dev Tools`
5. 添加 "Keyword"（关键字）触发器：
   - Keyword: `dt`
   - Argument: Required
   - Placeholder: `工具名称 (json/base64/timestamp/uuid)`
6. 连接 "Run Script"（运行脚本）操作：
   - Language: `/bin/bash`
   - Script:
   ```bash
   # 获取工具名称参数
   TOOL_NAME="$1"
   
   # 验证工具名称
   case "$TOOL_NAME" in
     json|base64|timestamp|uuid)
       # 使用命令行参数打开应用
       open -a "DevTools" --args "$TOOL_NAME"
       ;;
     *)
       echo "无效的工具名称: $TOOL_NAME"
       echo "可用工具: json, base64, timestamp, uuid"
       exit 1
       ;;
   esac
   ```
7. 保存工作流

### 方法三：为每个工具创建独立的关键字

如果你希望为每个工具创建独立的关键字（如 `dtjson`、`dtbase64` 等），可以：

1. 为每个工具创建单独的工作流
2. 或者在一个工作流中创建多个关键字触发器

示例：为 JSON 工具创建 `dtjson` 关键字

1. 添加 "Keyword" 触发器：
   - Keyword: `dtjson`
   - Argument: Optional
2. 连接 "Run Script" 操作：
   ```bash
   open "devtools://tool/json"
   ```

## 使用方式

配置完成后，在 Alfred 中输入：
- `dt json` - 打开 JSON 工具
- `dt base64` - 打开 Base64 工具
- `dt timestamp` - 打开时间戳工具
- `dt uuid` - 打开 UUID 工具

按回车键后，Dev Tools 应用会启动（如果未运行）或切换到指定工具页面（如果已运行）。

## 注意事项

1. **应用路径**：确保 Alfred 能找到 Dev Tools 应用。如果应用安装在非标准位置，需要在脚本中使用完整路径：
   ```bash
   open "/Applications/DevTools.app" --args "$TOOL_NAME"
   ```

2. **URL Scheme 权限**：首次使用 URL Scheme 时，macOS 可能会询问是否允许打开该 URL。选择"允许"即可。

3. **应用名称**：如果应用名称不是 "DevTools"，请相应修改脚本中的应用名称。

## 故障排除

### 问题：Alfred 无法打开应用

**解决方案**：
1. 检查应用是否已正确安装
2. 在终端中手动测试命令：
   ```bash
   open "devtools://tool/json"
   ```
   或
   ```bash
   open -a "DevTools" --args json
   ```

### 问题：应用已运行但不切换工具

**解决方案**：
1. 确保应用版本支持工具导航功能（v1.0.6+）
2. 检查 URL Scheme 是否正确配置在 `wails.json` 中
3. 查看应用控制台是否有错误信息

### 问题：Alfred 提示找不到应用

**解决方案**：
1. 在脚本中使用应用的完整路径
2. 确保应用已正确安装到 Applications 目录
3. 重新构建应用以确保 URL Scheme 已注册

## 高级配置

### 添加工具名称自动补全

可以在 Alfred 工作流中添加 "Script Filter" 来提供工具名称的自动补全：

1. 添加 "Script Filter" 触发器
2. 设置 Script：
   ```bash
   cat <<EOF
   {
     "items": [
       {
         "title": "JSON 工具",
         "subtitle": "格式化、验证、转换 JSON",
         "arg": "json",
         "icon": {"path": "icon.png"}
       },
       {
         "title": "Base64 工具",
         "subtitle": "Base64 编码/解码",
         "arg": "base64",
         "icon": {"path": "icon.png"}
       },
       {
         "title": "时间戳工具",
         "subtitle": "时间戳转换",
         "arg": "timestamp",
         "icon": {"path": "icon.png"}
       },
       {
         "title": "UUID 工具",
         "subtitle": "生成 UUID",
         "arg": "uuid",
         "icon": {"path": "icon.png"}
       }
     ]
   }
   EOF
   ```
3. 连接 "Run Script" 操作，使用 `{query}` 变量获取选中的工具名称

## 参考

- [Alfred Workflows 文档](https://www.alfredapp.com/help/workflows/)
- [Wails URL Scheme 文档](https://wails.io/docs/v2/reference/options#urlscheme)

