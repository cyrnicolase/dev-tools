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
      description: '格式化、验证和转换 JSON 数据',
      alfred: 'json',
      usage: [
        '在输入框中粘贴或输入 JSON 数据',
        '点击"格式化"按钮美化 JSON 格式',
        '点击"压缩"按钮将 JSON 压缩为一行',
        '切换"转换为 YAML"可以将 JSON 转换为 YAML 格式',
        '使用"复制"按钮复制处理后的内容',
        '点击最大化按钮可以全屏编辑'
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
        '支持多种时间格式',
        '自动识别时间戳单位（秒/毫秒）'
      ]
    },
    {
      icon: '🆔',
      name: 'UUID 工具',
      description: '生成 UUID（通用唯一标识符）',
      alfred: 'uuid',
      usage: [
        '点击"生成 UUID"按钮生成新的 UUID',
        '可以一次生成多个 UUID',
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
    }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">使用说明</h2>
        <p className="text-gray-600 text-sm select-none">了解各个工具的功能和使用方法</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Alfred 使用说明 */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <span className="text-4xl select-none">⚡</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 select-none">
                  Alfred 快速启动
                </h3>
                <p className="text-gray-600 mb-4 select-none">
                  通过 Alfred 可以快速打开指定的工具，提高工作效率
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 select-none">
                    使用方法：
                  </h4>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm text-gray-600 flex items-start select-none">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span>在 Alfred 中输入命令：<code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">devtools &lt;工具名&gt;</code></span>
                    </li>
                    <li className="text-sm text-gray-600 flex items-start select-none">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span>或者使用 URL Scheme：<code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">devtools://tool/&lt;工具名&gt;</code></span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2 select-none">
                      可用工具参数：
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 select-none"
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
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <span className="text-4xl select-none">{tool.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 select-none">
                      {tool.name}
                    </h3>
                    {tool.alfred && (
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded select-none">
                        Alfred: {tool.alfred}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 select-none">{tool.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 select-none">
                      使用方法：
                    </h4>
                    <ul className="space-y-2">
                      {tool.usage.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-sm text-gray-600 flex items-start select-none"
                        >
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    {tool.alfred && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 select-none">
                          Alfred 调用：
                        </h4>
                        <div className="bg-gray-100 rounded p-2 font-mono text-xs text-gray-800 select-all">
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

