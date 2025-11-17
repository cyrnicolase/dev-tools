# Dev Tools 桌面应用开发计划

## 项目结构

采用 DDD 限界上下文（Bounded Context）架构，每个工具完全独立：

```
tools/
├── cmd/
│   └── app/              # Wails 应用入口
├── internal/
│   ├── json/             # JSON 工具（独立限界上下文）
│   │   ├── domain/       # 领域层
│   │   │   ├── formatter.go
│   │   │   ├── validator.go
│   │   │   └── converter.go
│   │   ├── application/  # 应用层
│   │   │   └── service.go
│   │   └── interfaces/   # 接口层
│   │       └── api.go    # Wails API 接口
│   ├── base64/           # Base64 工具（独立限界上下文）
│   │   ├── domain/
│   │   │   ├── encoder.go
│   │   │   ├── decoder.go
│   │   │   └── validator.go
│   │   ├── application/
│   │   │   └── service.go
│   │   └── interfaces/
│   │       └── api.go
│   ├── timestamp/        # 时间戳工具（独立限界上下文）
│   │   ├── domain/
│   │   │   ├── converter.go
│   │   │   ├── formatter.go
│   │   │   └── timezone.go
│   │   ├── application/
│   │   │   └── service.go
│   │   └── interfaces/
│   │       └── api.go
│   ├── uuid/            # UUID 工具（独立限界上下文）
│   │   ├── domain/
│   │   │   └── generator.go
│   │   ├── application/
│   │   │   └── service.go
│   │   └── interfaces/
│   │       └── api.go
│   └── infrastructure/   # 基础设施层（共享）
│       └── wails/        # Wails 适配器
├── frontend/             # 前端代码（完全隔离）
│   ├── src/
│   │   ├── components/   # 共享组件（仅导航等）
│   │   ├── tools/        # 工具目录（完全隔离）
│   │   │   ├── json/     # JSON 工具（独立目录）
│   │   │   │   ├── JsonTool.jsx
│   │   │   │   ├── JsonFormatter.jsx
│   │   │   │   └── styles.css
│   │   │   ├── base64/   # Base64 工具（独立目录）
│   │   │   │   ├── Base64Tool.jsx
│   │   │   │   ├── Base64Encoder.jsx
│   │   │   │   └── styles.css
│   │   │   └── timestamp/# 时间戳工具（独立目录）
│   │   │       ├── TimestampTool.jsx
│   │   │       ├── TimestampConverter.jsx
│   │   │       └── styles.css
│   │   │   └── uuid/     # UUID 工具（独立目录）
│   │   │       ├── UuidTool.jsx
│   │   │       └── styles.css
│   │   ├── App.jsx       # 主应用（路由）
│   │   └── index.js      # 入口
│   └── index.html
├── go.mod
├── go.sum
├── app.json              # Wails 配置
└── main.go
```

**架构优势**：
- ✅ 符合 DDD 限界上下文原则，每个工具是独立的业务边界
- ✅ 完全隔离，修改一个工具不影响其他工具
- ✅ 便于扩展，新增工具只需添加新的限界上下文
- ✅ 清晰的模块边界，便于代码审查和维护

## 实现步骤

### 1. 项目初始化
- 初始化 Go 模块 (`go mod init`)
- 配置 Wails 项目 (`wails init`)
- 创建基础目录结构（按限界上下文组织）

### 2. JSON 工具实现
- **领域层** (`internal/json/domain/`)
  - `formatter.go`: JSON 格式化（美化、压缩）
  - `validator.go`: JSON 验证
  - `converter.go`: JSON 与其他格式转换
- **应用层** (`internal/json/application/service.go`)
  - 实现 JSON 用例服务
- **接口层** (`internal/json/interfaces/api.go`)
  - 定义 Wails API 接口

### 3. Base64 工具实现
- **领域层** (`internal/base64/domain/`)
  - `encoder.go`: Base64 编码
  - `decoder.go`: Base64 解码
  - `validator.go`: Base64 格式验证
- **应用层** (`internal/base64/application/service.go`)
  - 实现 Base64 用例服务
- **接口层** (`internal/base64/interfaces/api.go`)
  - 定义 Wails API 接口

### 4. 时间戳工具实现
- **领域层** (`internal/timestamp/domain/`)
  - `converter.go`: 时间戳与时间格式转换
  - `formatter.go`: 时间格式化
  - `timezone.go`: 时区处理
- **应用层** (`internal/timestamp/application/service.go`)
  - 实现时间戳用例服务
- **接口层** (`internal/timestamp/interfaces/api.go`)
  - 定义 Wails API 接口

### 5. UUID 工具实现
- **领域层** (`internal/uuid/domain/`)
  - `generator.go`: UUID 生成器
    - `GenerateV1()`: 生成 UUID v1（基于时间戳和 MAC 地址）
    - `GenerateV3(namespace, name string)`: 生成 UUID v3（基于命名空间和名称的 MD5）
    - `GenerateV4()`: 生成 UUID v4（随机，默认）
    - `GenerateV5(namespace, name string)`: 生成 UUID v5（基于命名空间和名称的 SHA-1）
    - `GenerateBatch(version string, count int, namespace, name string)`: 批量生成
- **应用层** (`internal/uuid/application/service.go`)
  - 实现 UUID 用例服务，编排领域逻辑
- **接口层** (`internal/uuid/interfaces/api.go`)
  - 定义 Wails API 接口
  - 暴露方法：GenerateV1, GenerateV3, GenerateV4, GenerateV5, GenerateBatch

### 6. Wails 集成
- 在 `cmd/app/app.go` 中注册各工具的 API
- 配置 Wails 应用窗口
- 绑定后端 API 到前端
- 为每个工具添加代理方法

### 7. 前端实现
- 使用 React + Tailwind CSS
- 创建主界面布局（侧边栏导航 + 内容区）
- 实现 JSON 工具页面 (`frontend/src/tools/json/`)
- 实现 Base64 工具页面 (`frontend/src/tools/base64/`)
- 实现时间戳工具页面 (`frontend/src/tools/timestamp/`)
- 实现 UUID 工具页面 (`frontend/src/tools/uuid/`)
  - UUID 版本选择（v1, v3, v4, v5），默认 v4
  - 批量生成数量输入
  - v3/v5 的 namespace 和 name 输入（可选）
  - 结果显示区域（支持复制）
  - 批量结果以列表形式显示
- 每个工具目录独立，包含组件和样式

### 8. 代码质量
- 为每个领域层添加单元测试
- 配置 golangci-lint
- 确保代码编译通过
- 代码规范检查

## 技术选型

- **后端**: Go 1.25.4
- **框架**: Wails v2
- **前端**: React + Tailwind CSS
- **架构**: DDD 限界上下文
- **测试**: Go testing 包

## 核心文件

- `internal/json/domain/formatter.go`: JSON 格式化核心逻辑
- `internal/base64/domain/encoder.go`: Base64 编码解码逻辑
- `internal/timestamp/domain/converter.go`: 时间戳转换逻辑
- `internal/uuid/domain/generator.go`: UUID 生成核心逻辑
- `internal/{json,base64,timestamp,uuid}/interfaces/api.go`: 各工具的 Wails API
- `frontend/src/tools/{json,base64,timestamp,uuid}/`: 各工具的前端实现
- `cmd/app/app.go`: Wails 应用入口和 API 注册

## 功能需求

### JSON 工具
- JSON 格式化（美化、压缩）
- JSON 验证
- JSON 与其他格式转换

### Base64 工具
- Base64 编码
- Base64 解码
- Base64 格式验证

### 时间戳工具
- 时间戳与时间格式转换
- 时间格式化
- 时区处理
- 当前时间显示

### UUID 工具
- UUID v1 生成（基于时间戳和 MAC 地址）
- UUID v3 生成（基于命名空间和名称的 MD5）
- UUID v4 生成（随机，默认）
- UUID v5 生成（基于命名空间和名称的 SHA-1）
- 批量生成 UUID
- 支持复制生成的 UUID

