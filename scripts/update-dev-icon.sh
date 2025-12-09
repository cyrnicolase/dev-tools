#!/bin/bash
# 在开发模式下更新应用图标

APPICON_ICNS="build/appicon.icns"
APP_RESOURCES="build/bin/DevTools.app/Contents/Resources"
ICON_FILE="${APP_RESOURCES}/iconfile.icns"

# 等待应用包生成
MAX_WAIT=30
WAITED=0

while [ ! -d "$APP_RESOURCES" ] && [ $WAITED -lt $MAX_WAIT ]; do
    sleep 1
    WAITED=$((WAITED + 1))
done

# 如果应用包已生成且图标文件存在，则复制图标
if [ -d "$APP_RESOURCES" ] && [ -f "$APPICON_ICNS" ]; then
    cp "$APPICON_ICNS" "$ICON_FILE" 2>/dev/null && \
    touch "build/bin/DevTools.app" 2>/dev/null && \
    echo "✓ 开发模式图标已更新"
fi

# 持续监控并更新图标（当应用包重新生成时）
while true; do
    sleep 2
    if [ -d "$APP_RESOURCES" ] && [ -f "$APPICON_ICNS" ]; then
        # 检查图标是否需要更新
        if [ ! -f "$ICON_FILE" ] || [ "$APPICON_ICNS" -nt "$ICON_FILE" ]; then
            cp "$APPICON_ICNS" "$ICON_FILE" 2>/dev/null && \
            touch "build/bin/DevTools.app" 2>/dev/null
        fi
    fi
done

