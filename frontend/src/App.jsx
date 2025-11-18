import React, { useState, useEffect, useRef } from 'react'
import JsonTool from './tools/json/JsonTool'
import Base64Tool from './tools/base64/Base64Tool'
import TimestampTool from './tools/timestamp/TimestampTool'
import UuidTool from './tools/uuid/UuidTool'
import UrlTool from './tools/url/UrlTool'
import { waitForWailsAPI, getWailsAPI } from './utils/api'

function App() {
  const [activeTool, setActiveTool] = useState('json')
  const [version, setVersion] = useState('1.0.6')
  const [apiReady, setApiReady] = useState(false)
  const [initialToolHandled, setInitialToolHandled] = useState(false)
  const lastCheckedToolRef = useRef('')

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
        
        // 获取启动时指定的工具名称（只在启动时检查一次）
        if (api.GetInitialTool && !initialToolHandled) {
          api.GetInitialTool()
            .then((toolName) => {
              if (toolName && toolName.trim() !== '') {
                // 验证工具名称是否有效
                const validTools = ['json', 'base64', 'timestamp', 'uuid', 'url']
                const normalizedTool = toolName.toLowerCase().trim()
                if (validTools.includes(normalizedTool)) {
                  setActiveTool(normalizedTool)
                  lastCheckedToolRef.current = normalizedTool
                  // 立即清除初始工具设置，防止轮询时重复切换
                  // 使用 setTimeout 确保清除操作在状态更新后执行
                  setTimeout(() => {
                    if (api.ClearInitialTool) {
                      api.ClearInitialTool().catch(() => {
                        // 忽略错误
                      })
                    }
                  }, 100)
                } else {
                  // 即使工具名称无效，也要清除并标记为已处理
                  if (api.ClearInitialTool) {
                    api.ClearInitialTool().catch(() => {})
                  }
                }
              }
              setInitialToolHandled(true)
            })
            .catch((e) => {
              console.error('获取初始工具失败:', e)
              setInitialToolHandled(true)
            })
        } else {
          // 如果没有初始工具，也标记为已处理
          setInitialToolHandled(true)
        }
      })
      .catch((err) => {
        console.error('Wails API 初始化失败:', err)
      })
  }, [initialToolHandled])

  // 当用户手动切换工具时，更新 lastCheckedToolRef
  useEffect(() => {
    if (initialToolHandled) {
      lastCheckedToolRef.current = activeTool
    }
  }, [activeTool, initialToolHandled])

  // 监听工具变化（用于处理应用已运行时的外部调用，如 Alfred）
  useEffect(() => {
    if (!apiReady || !initialToolHandled) return

    const checkToolChange = async () => {
      const api = getWailsAPI()
      if (api?.GetInitialTool) {
        try {
          const toolName = await api.GetInitialTool()
          if (toolName && toolName.trim() !== '') {
            const normalizedTool = toolName.toLowerCase().trim()
            const validTools = ['json', 'base64', 'timestamp', 'uuid', 'url']
            // 只有当工具名称与上次检查的不同时才切换（检测外部新请求）
            // 如果与 lastCheckedToolRef 相同，说明已经处理过了，不再切换
            if (validTools.includes(normalizedTool) && 
                normalizedTool !== lastCheckedToolRef.current &&
                normalizedTool !== activeTool) {
              setActiveTool(normalizedTool)
              lastCheckedToolRef.current = normalizedTool
              // 清除初始工具设置，防止下次轮询时再次切换
              if (api.ClearInitialTool) {
                api.ClearInitialTool().catch(() => {
                  // 忽略错误
                })
              }
            }
          }
          // 如果 initialTool 为空，说明已经清除，不需要做任何操作
        } catch (e) {
          // 忽略错误
        }
      }
    }

    // 定期检查工具变化（每 500ms 检查一次）
    const interval = setInterval(checkToolChange, 500)
    return () => clearInterval(interval)
  }, [apiReady, initialToolHandled, activeTool])

  const tools = [
    { id: 'json', name: 'JSON', icon: '📄' },
    { id: 'base64', name: 'Base64', icon: '🔐' },
    { id: 'timestamp', name: '时间戳', icon: '⏰' },
    { id: 'uuid', name: 'UUID', icon: '🆔' },
    { id: 'url', name: 'URL', icon: '🔗' },
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
      case 'url':
        return <UrlTool />
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

