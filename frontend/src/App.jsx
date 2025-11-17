import React, { useState, useEffect } from 'react'
import JsonTool from './tools/json/JsonTool'
import Base64Tool from './tools/base64/Base64Tool'
import TimestampTool from './tools/timestamp/TimestampTool'
import UuidTool from './tools/uuid/UuidTool'
import { waitForWailsAPI, getWailsAPI } from './utils/api'

function App() {
  const [activeTool, setActiveTool] = useState('json')
  const [version, setVersion] = useState('1.0.6')
  const [apiReady, setApiReady] = useState(false)

  useEffect(() => {
    // 等待 Wails API 初始化
    waitForWailsAPI()
      .then((api) => {
        setApiReady(true)
        // 获取版本号
        if (api.GetVersion) {
          api.GetVersion()
            .then((v) => {
              if (v) setVersion(v)
            })
            .catch((e) => {
              console.error('获取版本号失败:', e)
            })
        }
        
        // 获取启动时指定的工具名称
        if (api.GetInitialTool) {
          api.GetInitialTool()
            .then((toolName) => {
              if (toolName && toolName.trim() !== '') {
                // 验证工具名称是否有效
                const validTools = ['json', 'base64', 'timestamp', 'uuid']
                const normalizedTool = toolName.toLowerCase().trim()
                if (validTools.includes(normalizedTool)) {
                  setActiveTool(normalizedTool)
                }
              }
            })
            .catch((e) => {
              console.error('获取初始工具失败:', e)
            })
        }
      })
      .catch((err) => {
        console.error('Wails API 初始化失败:', err)
      })
  }, [])

  // 监听工具变化（用于处理应用已运行时的 URL Scheme 调用）
  useEffect(() => {
    if (!apiReady) return

    const checkToolChange = async () => {
      const api = getWailsAPI()
      if (api?.GetInitialTool) {
        try {
          const toolName = await api.GetInitialTool()
          if (toolName && toolName.trim() !== '') {
            const normalizedTool = toolName.toLowerCase().trim()
            const validTools = ['json', 'base64', 'timestamp', 'uuid']
            if (validTools.includes(normalizedTool) && normalizedTool !== activeTool) {
              setActiveTool(normalizedTool)
            }
          }
        } catch (e) {
          // 忽略错误
        }
      }
    }

    // 定期检查工具变化（每 500ms 检查一次）
    const interval = setInterval(checkToolChange, 500)
    return () => clearInterval(interval)
  }, [apiReady, activeTool])

  const tools = [
    { id: 'json', name: 'JSON', icon: '📄' },
    { id: 'base64', name: 'Base64', icon: '🔐' },
    { id: 'timestamp', name: '时间戳', icon: '⏰' },
    { id: 'uuid', name: 'UUID', icon: '🆔' },
  ]

  const renderTool = () => {
    switch (activeTool) {
      case 'json':
        return <JsonTool />
      case 'base64':
        return <Base64Tool />
      case 'timestamp':
        return <TimestampTool />
      case 'uuid':
        return <UuidTool />
      default:
        return <JsonTool />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Dev Tools</h1>
          <p className="text-sm text-gray-500 mt-1">开发工具集</p>
          <p className="text-xs text-gray-400 mt-2">v{version}</p>
        </div>
        <nav className="p-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTool === tool.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{tool.icon}</span>
              <span>{tool.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {renderTool()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

