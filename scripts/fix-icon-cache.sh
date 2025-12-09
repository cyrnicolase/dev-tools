#!/bin/bash
# 清理 macOS 图标缓存并刷新应用图标显示

echo "正在清理 macOS 图标缓存..."

# 清理用户级图标缓存
rm -rf ~/Library/Caches/com.apple.iconservices.store 2>/dev/null
rm -rf ~/Library/Caches/com.apple.iconservices 2>/dev/null

# 清理系统级图标缓存（需要管理员权限）
if [ "$EUID" -eq 0 ]; then
    rm -rf /Library/Caches/com.apple.iconservices.store 2>/dev/null
    rm -rf /Library/Caches/com.apple.iconservices 2>/dev/null
    echo "✓ 已清理系统级图标缓存"
else
    echo "提示: 如需清理系统级缓存，请使用: sudo rm -rf /Library/Caches/com.apple.iconservices.store"
fi

# 重启 Dock 和 Finder
echo "正在重启 Dock 和 Finder..."
killall Dock 2>/dev/null
killall Finder 2>/dev/null

echo ""
echo "✓ 图标缓存已清理，Dock 和 Finder 已重启"
echo ""
echo "如果图标仍然显示为方形，可能是以下原因："
echo "1. 图标内容延伸到边缘 - macOS 的圆角效果是系统自动添加的，但如果图标内容"
echo "   填满整个画布（延伸到边缘），即使有圆角，视觉效果可能仍然像方形"
echo "2. 应用未签名 - 未签名的应用可能影响图标显示"
echo ""
echo "建议："
echo "- 检查图标设计，确保图标内容保留约 10% 的边距"
echo "- 如果可能，对应用进行签名"

