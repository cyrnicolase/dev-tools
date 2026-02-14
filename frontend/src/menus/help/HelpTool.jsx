import React, { useEffect, useRef } from 'react'

function HelpTool({ scrollToToolId }) {
  const toolRefs = useRef({})

  useEffect(() => {
    if (scrollToToolId) {
      const element = toolRefs.current[scrollToToolId]
      if (element) {
        // 延迟滚动，确保组件已完全渲染
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [scrollToToolId])
  const tools = [
    {
      icon: '📄',
      name: 'JSON 工具',
      description: '格式化、验证和转换 JSON 数据，支持多标签页编辑',
      alfred: 'json',
      usage: [
        '多标签页功能：',
        '  - 点击右上角"+"按钮或使用 Cmd/Ctrl+T 创建新标签页',
        '  - 双击标签名称可以重命名标签页',
        '  - 鼠标悬停在标签上会显示关闭按钮，点击可关闭标签页',
        '  - 使用鼠标中键点击标签页也可以快速关闭',
        '  - 使用 Cmd/Ctrl+W 关闭当前标签页',
        '  - 使用 Ctrl+Tab 切换到下一个标签页',
        '  - 使用 Ctrl+Shift+Tab 切换到上一个标签页',
        '  - 最多支持 20 个标签页',
        '',
        'JSON 处理功能：',
        '  - 在输入框中粘贴或输入 JSON 数据',
        '  - 点击"格式化"按钮或使用 Cmd/Ctrl+Enter 快捷键美化 JSON 格式',
        '  - 点击"压缩"按钮将 JSON 压缩为一行',
        '  - 切换"转换为 YAML"可以将 JSON 转换为 YAML 格式',
        '  - 使用"复制"按钮复制处理后的内容',
        '  - 点击最大化按钮可以全屏编辑',
        '  - 支持 JSON 语法高亮和搜索功能'
      ]
    },
    {
      icon: '🔐',
      name: 'Base64 工具',
      description: 'Base64 编码和解码',
      alfred: 'base64',
      usage: [
        '在输入框中输入要编码或解码的内容',
        '选择"编码"或"解码"模式',
        '可选择"URL 安全"选项（编码时）',
        '点击"编码"或"解码"按钮执行操作',
        '使用"复制"按钮复制结果'
      ]
    },
    {
      icon: '⏰',
      name: '时间戳工具',
      description: '时间戳与日期时间相互转换',
      alfred: 'timestamp',
      usage: [
        '输入时间戳（秒或毫秒）可转换为日期时间',
        '或选择日期时间转换为时间戳',
        '时间转时间戳同时输出秒级与毫秒级，均可复制',
        '支持多种时间格式',
        '时间戳转时间自动识别单位，仅支持 10 位（秒）或 13 位（毫秒）'
      ]
    },
    {
      icon: '🆔',
      name: 'UUID 工具',
      description: '生成 UUID（通用唯一标识符）',
      alfred: 'uuid',
      usage: [
        '选择 UUID 版本（v1、v3、v4、v5）',
        '设置生成数量（1-1000）',
        '配置格式选项：',
        '  - 大小写：小写（默认）或大写',
        '  - 连字符：带连字符（默认）或无连字符',
        'v3 和 v5 版本需要提供 namespace 和 name',
        '点击"生成 UUID"按钮生成',
        '使用"复制"按钮复制单个 UUID',
        '使用"复制全部"按钮复制所有 UUID'
      ]
    },
    {
      icon: '🔗',
      name: 'URL 工具',
      description: 'URL 编码和解码',
      alfred: 'url',
      usage: [
        '在输入框中输入要编码或解码的 URL',
        '选择"编码"或"解码"模式',
        '点击"编码"或"解码"按钮执行操作',
        '使用"复制"按钮复制结果'
      ]
    },
    {
      icon: '📱',
      name: '二维码工具',
      description: '生成二维码图片',
      alfred: 'qrcode',
      usage: [
        '在输入框中输入要生成二维码的内容',
        '选择二维码尺寸（小、中、大）',
        '点击"生成"按钮生成二维码',
        '生成的二维码会显示在下方',
        '点击"下载"按钮保存二维码图片'
      ]
    },
    {
      icon: '🌍',
      name: 'IP查询工具',
      description: '查询 IP 地址的地理位置信息',
      alfred: 'ipquery',
      usage: [
        '在输入框中输入要查询的 IP 地址',
        '支持 IPv4 和 IPv6 地址',
        '点击"查询"按钮获取 IP 信息',
        '会显示两个数据源的结果（ip-api.com 和 ipinfo.io）',
        '显示国家、省份/州、城市等信息',
        '使用"复制"按钮复制查询结果'
      ]
    },
    {
      icon: '🌐',
      name: '翻译工具',
      description: '支持中文、英文、韩文互译',
      alfred: 'translate',
      usage: [
        '首次使用需要配置API密钥（点击右上角设置按钮）',
        '访问有道智云注册并创建应用，获取 App Key 和 App Secret',
        '在配置页面输入 App Key 和 App Secret 并保存',
        '选择源语言和目标语言',
        '在输入框中输入要翻译的文本',
        '点击"翻译"按钮进行翻译',
        '使用"复制"按钮复制翻译结果',
        '点击交换按钮可以快速交换源语言和目标语言'
      ]
    },
    {
      icon: '🔑',
      name: '散列值计算工具',
      description: '计算文本和文件的散列值（MD5、SHA1、SHA256、SHA512）',
      alfred: 'hash',
      usage: [
        '选择输入方式：',
        '  - 文本输入：在输入框中输入或粘贴要计算散列值的文本',
        '  - 文件选择：点击"浏览文件"按钮选择要计算散列值的文件',
        '选择散列算法：MD5、SHA1、SHA256 或 SHA512',
        '点击"计算"按钮计算散列值',
        '计算结果会显示在输出区域',
        '使用"复制"按钮复制散列值结果',
        '支持对文本内容和文件进行散列值计算'
      ]
    },
    {
      icon: '🎲',
      name: '随机字符串工具',
      description: '生成随机字符串，支持自定义长度、字符类型和批量生成',
      alfred: 'randomstring',
      usage: [
        '设置字符串长度：',
        '  - 可以从下拉框选择常用长度（8、16、32、64、128）',
        '  - 也可以在输入框中直接输入自定义长度（1-100）',
        '  - 输入框只允许输入数字',
        '选择字符类型（可多选）：',
        '  - 数字（0-9）',
        '  - 小写字母（a-z）',
        '  - 大写字母（A-Z）',
        '  - 特殊字符（!@#$%^&*...）',
        '设置生成数量（1-100，默认1）',
        '  - 输入框只允许输入数字',
        '点击"生成随机字符串"按钮生成',
        '使用"复制"按钮复制单个结果',
        '使用"复制全部"按钮复制所有结果（批量生成时）',
        '使用"清空"按钮清空所有生成结果'
      ]
    }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 select-none">使用说明</h2>
        <p className="text-[var(--text-secondary)] text-sm select-none">了解各个工具的功能和使用方法</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* 工具搜索说明 */}
          <div className="bg-secondary rounded-lg border border-border-primary p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <span className="text-4xl select-none">🔍</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 select-none">
                  工具搜索
                </h3>
                <p className="text-[var(--text-secondary)] mb-4 select-none">
                  快速搜索和切换工具，支持模糊匹配
                </p>
                <div className="bg-secondary rounded-lg p-4 border border-border-primary">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 select-none">
                    使用方法：
                  </h4>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>双击 <kbd className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">Shift</kbd> 键打开搜索框</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>支持模糊匹配搜索，例如：</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none ml-6">
                      <span className="text-link mr-2 mt-1">-</span>
                      <span>连续字符匹配：输入 <code className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">base</code> 可匹配 "Base64"</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none ml-6">
                      <span className="text-link mr-2 mt-1">-</span>
                      <span>通配符匹配：输入 <code className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">b*4</code> 可匹配 "Base64"（b 和 4 按顺序出现）</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none ml-6">
                      <span className="text-link mr-2 mt-1">-</span>
                      <span>输入 <code className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">b*s*4</code> 可匹配 "Base64"（b、s、4 按顺序出现）</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>使用 <kbd className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">↑</kbd> <kbd className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">↓</kbd> 键导航搜索结果</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>按 <kbd className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">Enter</kbd> 键选择工具</span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>按 <kbd className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">Esc</kbd> 键关闭搜索框</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Alfred 使用说明 */}
          <div className="bg-secondary rounded-lg border border-border-primary p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <span className="text-4xl select-none">⚡</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 select-none">
                  Alfred 快速启动
                </h3>
                <p className="text-[var(--text-secondary)] mb-4 select-none">
                  通过 Alfred 可以快速打开指定的工具，提高工作效率
                </p>
                <div className="bg-secondary rounded-lg p-4 border border-border-primary">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 select-none">
                    使用方法：
                  </h4>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>在 Alfred 中输入命令：<code className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">devtools &lt;工具名&gt;</code></span>
                    </li>
                    <li className="text-sm text-[var(--text-secondary)] flex items-start select-none">
                      <span className="text-link mr-2 mt-1">•</span>
                      <span>或者使用 URL Scheme：<code className="bg-input-disabled px-2 py-1 rounded text-xs font-mono text-[var(--text-input)]">devtools://tool/&lt;工具名&gt;</code></span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-[var(--text-primary)] mb-2 select-none">
                      可用工具参数：
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-active-bg text-active-text select-none"
                        >
                          {tool.icon} {tool.alfred}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 工具列表 */}
          {tools.map((tool, index) => (
            <div
              key={index}
              id={`tool-${tool.alfred}`}
              ref={(el) => {
                if (tool.alfred) {
                  toolRefs.current[tool.alfred] = el
                }
              }}
              className="bg-secondary rounded-lg border border-border-primary p-6 shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <span className="text-4xl select-none">{tool.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] select-none">
                      {tool.name}
                    </h3>
                    {tool.alfred && (
                      <span className="text-xs font-mono bg-input-disabled text-[var(--text-input)] px-2 py-1 rounded select-none">
                        Alfred: {tool.alfred}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] mb-4 select-none">{tool.description}</p>
                  <div className="bg-input-disabled rounded-lg p-4">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 select-none">
                      使用方法：
                    </h4>
                    <ul className="space-y-2">
                      {tool.usage.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-sm text-[var(--text-secondary)] flex items-start select-none"
                        >
                          <span className="text-link mr-2 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    {tool.alfred && (
                      <div className="mt-4 pt-4 border-t border-border-input">
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2 select-none">
                          Alfred 调用：
                        </h4>
                        <div className="bg-input-disabled rounded p-2 font-mono text-xs text-[var(--text-input)] select-all">
                          devtools://tool/{tool.alfred}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HelpTool

