.PHONY: help dev build build-mac build-all clean install frontend-install frontend-build frontend-dev lint test run

# 默认目标
help:
	@echo "可用命令:"
	@echo "  make dev              - 启动开发模式（Wails dev）"
	@echo "  make build            - 构建应用（当前平台）"
	@echo "  make build-mac        - 构建 macOS 应用（darwin/amd64）"
	@echo "  make build-all        - 构建所有平台"
	@echo "  make clean            - 清理构建产物"
	@echo "  make install          - 安装所有依赖（Go + Frontend）"
	@echo "  make frontend-install - 安装前端依赖"
	@echo "  make frontend-build   - 构建前端"
	@echo "  make frontend-dev     - 启动前端开发服务器"
	@echo "  make lint             - 运行代码检查"
	@echo "  make test             - 运行测试"
	@echo "  make run              - 运行应用（需要先构建）"

# 开发模式
dev:
	@echo "启动 Wails 开发模式..."
	@if [ ! -f "frontend/dist/index.html" ]; then \
		echo "前端构建文件不存在，正在构建前端..."; \
		$(MAKE) frontend-build; \
	fi
	wails dev

# 构建应用（当前平台）
build:
	@echo "构建应用（当前平台）..."
	wails build

# 构建 macOS 应用
build-mac:
	@echo "构建 macOS 应用..."
	wails build -platform darwin/amd64

# 构建所有平台（示例，可根据需要调整）
build-all:
	@echo "构建所有平台..."
	@echo "构建 macOS..."
	wails build -platform darwin/amd64
	@echo "构建 Windows..."
	wails build -platform windows/amd64
	@echo "构建 Linux..."
	wails build -platform linux/amd64

# 清理构建产物
clean:
	@echo "清理构建产物..."
	rm -rf build/
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite/
	@echo "清理完成"

# 安装所有依赖
install: frontend-install
	@echo "安装 Go 依赖..."
	go mod tidy
	@echo "所有依赖安装完成"

# 安装前端依赖
frontend-install:
	@echo "安装前端依赖..."
	cd frontend && npm install

# 构建前端
frontend-build:
	@echo "构建前端..."
	cd frontend && npm run build

# 前端开发服务器
frontend-dev:
	@echo "启动前端开发服务器..."
	cd frontend && npm run dev

# 代码检查
lint:
	@echo "运行 Go 代码检查..."
	golangci-lint run ./...
	@echo "代码检查完成"

# 运行测试
test:
	@echo "运行 Go 测试..."
	go test ./...
	@echo "测试完成"

# 运行应用（需要先构建）
run:
	@echo "运行应用..."
	@if [ -f "build/bin/Dev Tools.app/Contents/MacOS/Dev Tools" ]; then \
		open "build/bin/Dev Tools.app"; \
	elif [ -f "build/bin/Dev Tools.exe" ]; then \
		./build/bin/Dev\ Tools.exe; \
	elif [ -f "build/bin/Dev Tools" ]; then \
		./build/bin/Dev\ Tools; \
	else \
		echo "错误: 找不到构建产物，请先运行 make build"; \
		exit 1; \
	fi

