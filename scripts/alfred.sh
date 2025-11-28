#!/bin/bash

# 获取工具名称参数
TOOL_NAME="$1"

# 验证工具名称
case "$TOOL_NAME" in
  json|base64|timestamp|uuid|url|qrcode)
    # 使用 URL Scheme 打开应用
    open "devtools://tool/$TOOL_NAME"
    ;;
  *)
    echo "无效的工具名称: $TOOL_NAME"
    echo "可用工具: json, base64, timestamp, uuid, url, qrcode"
    exit 1
    ;;
esac
