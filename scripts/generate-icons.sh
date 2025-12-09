#!/bin/bash
# 从 appicon.png 生成符合不同操作系统要求的图标文件

set -e

APPICON_SRC="${1:-appicon.png}"
OUTPUT_DIR="${2:-build}"
PLATFORM="${3:-$(uname -s)}"

# 检查源文件是否存在
if [ ! -f "$APPICON_SRC" ]; then
    echo "错误: 找不到图标文件 $APPICON_SRC"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 根据平台生成相应格式的图标
case "$PLATFORM" in
    Darwin|darwin|macos)
        echo "正在为 macOS 生成 .icns 文件..."
        ICONSET_DIR="${OUTPUT_DIR}/appicon.iconset"
        mkdir -p "$ICONSET_DIR"
        
        # 生成所有需要的尺寸
        sips -z 16 16 "$APPICON_SRC" --out "$ICONSET_DIR/icon_16x16.png" > /dev/null 2>&1
        sips -z 32 32 "$APPICON_SRC" --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null 2>&1
        sips -z 32 32 "$APPICON_SRC" --out "$ICONSET_DIR/icon_32x32.png" > /dev/null 2>&1
        sips -z 64 64 "$APPICON_SRC" --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null 2>&1
        sips -z 128 128 "$APPICON_SRC" --out "$ICONSET_DIR/icon_128x128.png" > /dev/null 2>&1
        sips -z 256 256 "$APPICON_SRC" --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null 2>&1
        sips -z 256 256 "$APPICON_SRC" --out "$ICONSET_DIR/icon_256x256.png" > /dev/null 2>&1
        sips -z 512 512 "$APPICON_SRC" --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null 2>&1
        sips -z 512 512 "$APPICON_SRC" --out "$ICONSET_DIR/icon_512x512.png" > /dev/null 2>&1
        sips -z 1024 1024 "$APPICON_SRC" --out "$ICONSET_DIR/icon_512x512@2x.png" > /dev/null 2>&1
        
        # 生成 .icns 文件
        iconutil -c icns "$ICONSET_DIR" -o "${OUTPUT_DIR}/appicon.icns"
        
        # 清理临时目录
        rm -rf "$ICONSET_DIR"
        
        echo "✓ macOS 图标已生成: ${OUTPUT_DIR}/appicon.icns"
        ;;
    
    Windows|windows|win32)
        echo "正在为 Windows 生成 .ico 文件..."
        # 优先使用 ImageMagick 生成 ICO（支持多尺寸）
        if command -v convert > /dev/null 2>&1; then
            convert "$APPICON_SRC" -define icon:auto-resize=256,128,64,48,32,16 "${OUTPUT_DIR}/appicon.ico"
            echo "✓ Windows 图标已生成: ${OUTPUT_DIR}/appicon.ico"
        elif command -v sips > /dev/null 2>&1; then
            # macOS 上如果没有 ImageMagick，使用 sips 生成多尺寸 PNG，然后提示用户
            ICONSET_DIR="${OUTPUT_DIR}/windows_iconset"
            mkdir -p "$ICONSET_DIR"
            
            # 生成 Windows 需要的尺寸
            sips -z 16 16 "$APPICON_SRC" --out "$ICONSET_DIR/16.png" > /dev/null 2>&1
            sips -z 32 32 "$APPICON_SRC" --out "$ICONSET_DIR/32.png" > /dev/null 2>&1
            sips -z 48 48 "$APPICON_SRC" --out "$ICONSET_DIR/48.png" > /dev/null 2>&1
            sips -z 64 64 "$APPICON_SRC" --out "$ICONSET_DIR/64.png" > /dev/null 2>&1
            sips -z 128 128 "$APPICON_SRC" --out "$ICONSET_DIR/128.png" > /dev/null 2>&1
            sips -z 256 256 "$APPICON_SRC" --out "$ICONSET_DIR/256.png" > /dev/null 2>&1
            
            echo "警告: 未找到 ImageMagick，无法直接生成 .ico 文件"
            echo "提示: 安装 ImageMagick 以自动生成 .ico: brew install imagemagick"
            echo "已生成多尺寸 PNG 文件在: $ICONSET_DIR"
            echo "可以使用在线工具或 ImageMagick 将这些 PNG 合并为 .ico 文件"
            cp "$APPICON_SRC" "${OUTPUT_DIR}/appicon.png"
            
            rm -rf "$ICONSET_DIR"
        else
            echo "警告: 未找到 ImageMagick 或 sips，无法生成 .ico 文件"
            echo "提示: 安装 ImageMagick: brew install imagemagick 或 apt-get install imagemagick"
            cp "$APPICON_SRC" "${OUTPUT_DIR}/appicon.png"
        fi
        ;;
    
    Linux|linux)
        echo "正在为 Linux 准备 .png 文件..."
        # Linux 通常使用 PNG 格式，可以直接复制或生成不同尺寸
        cp "$APPICON_SRC" "${OUTPUT_DIR}/appicon.png"
        
        # 可选：生成不同尺寸的 PNG（用于不同场景）
        mkdir -p "${OUTPUT_DIR}/linux"
        sips -z 16 16 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/16.png" > /dev/null 2>&1 || true
        sips -z 32 32 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/32.png" > /dev/null 2>&1 || true
        sips -z 48 48 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/48.png" > /dev/null 2>&1 || true
        sips -z 64 64 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/64.png" > /dev/null 2>&1 || true
        sips -z 128 128 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/128.png" > /dev/null 2>&1 || true
        sips -z 256 256 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/256.png" > /dev/null 2>&1 || true
        sips -z 512 512 "$APPICON_SRC" --out "${OUTPUT_DIR}/linux/512.png" > /dev/null 2>&1 || true
        
        echo "✓ Linux 图标已生成: ${OUTPUT_DIR}/appicon.png"
        ;;
    
    *)
        echo "警告: 未知平台 $PLATFORM，使用默认 PNG 格式"
        cp "$APPICON_SRC" "${OUTPUT_DIR}/appicon.png"
        ;;
esac

