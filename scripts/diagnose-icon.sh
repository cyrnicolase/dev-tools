#!/bin/bash
# 诊断应用图标问题

echo "=== 应用图标诊断 ==="
echo ""

# 检查图标文件
echo "1. 检查图标文件："
if [ -f "build/appicon.icns" ]; then
    echo "   ✓ appicon.icns 存在"
    file build/appicon.icns
    ls -lh build/appicon.icns
else
    echo "   ✗ appicon.icns 不存在"
fi

echo ""
echo "2. 检查应用包中的图标："
if [ -f "build/bin/DevTools.app/Contents/Resources/iconfile.icns" ]; then
    echo "   ✓ iconfile.icns 存在"
    file build/bin/DevTools.app/Contents/Resources/iconfile.icns
    ls -lh build/bin/DevTools.app/Contents/Resources/iconfile.icns
else
    echo "   ✗ iconfile.icns 不存在"
fi

echo ""
echo "3. 检查 Info.plist 配置："
if [ -f "build/bin/DevTools.app/Contents/Info.plist" ]; then
    CFBundleIconFile=$(plutil -p build/bin/DevTools.app/Contents/Info.plist 2>/dev/null | grep CFBundleIconFile | cut -d'"' -f4)
    echo "   CFBundleIconFile: $CFBundleIconFile"
    if [ "$CFBundleIconFile" = "iconfile" ]; then
        echo "   ✓ 配置正确"
    else
        echo "   ✗ 配置可能有问题"
    fi
else
    echo "   ✗ Info.plist 不存在"
fi

echo ""
echo "4. 检查应用签名："
codesign -dvvv build/bin/DevTools.app 2>&1 | head -3

echo ""
echo "5. 清理图标缓存建议："
echo "   运行以下命令清理图标缓存："
echo "   sudo rm -rf /Library/Caches/com.apple.iconservices.store"
echo "   sudo rm -rf ~/Library/Caches/com.apple.iconservices.store"
echo "   killall Dock"
echo "   killall Finder"

echo ""
echo "6. 检查图标内容："
echo "   如果图标内容延伸到边缘，即使系统添加了圆角，视觉效果可能仍然像方形"
echo "   macOS 建议图标内容保留约 10% 的边距"
