import React, { useState, useEffect, useRef } from 'react'
import JsonTool from './tools/json/JsonTool'
import Base64Tool from './tools/base64/Base64Tool'
import TimestampTool from './tools/timestamp/TimestampTool'
import UuidTool from './tools/uuid/UuidTool'
import UrlTool from './tools/url/UrlTool'
import QrcodeTool from './tools/qrcode/QrcodeTool'
import IPQueryTool from './tools/ipquery/IPQueryTool'
import HelpTool from './menus/help/HelpTool'
import ThemeToggle from './components/ThemeToggle'
import { waitForWailsAPI, getWailsAPI } from './utils/api'
import { useTheme } from './hooks/useTheme'
import { TOOLS, VIEW_IDS, DEFAULT_TOOL_ID } from './constants/tools'

function App() {
  const [activeTool, setActiveTool] = useState(DEFAULT_TOOL_ID)
  const [version, setVersion] = useState('1.0.8')
  const [apiReady, setApiReady] = useState(false)
  const [initialToolHandled, setInitialToolHandled] = useState(false)
  const [helpToolId, setHelpToolId] = useState(null)
  const { theme, toggleTheme } = useTheme()
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
                const normalizedTool = toolName.toLowerCase().trim()
                if (VIEW_IDS.includes(normalizedTool)) {
                  setActiveTool(normalizedTool)
                  lastCheckedToolRef.current = normalizedTool
                  setTimeout(() => {
                    if (api.ClearInitialTool) {
                      api.ClearInitialTool().catch(() => {})
                    }
                  }, 100)
                } else {
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
            if (VIEW_IDS.includes(normalizedTool) && 
                normalizedTool !== lastCheckedToolRef.current &&
                normalizedTool !== activeTool) {
              setActiveTool(normalizedTool)
              lastCheckedToolRef.current = normalizedTool
              if (api.ClearInitialTool) {
                api.ClearInitialTool().catch(() => {})
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

  // 处理跳转到帮助页面的特定工具介绍
  const handleShowHelp = (toolId) => {
    setHelpToolId(toolId)
    setActiveTool('help')
  }

  return (
    <div className="flex h-screen bg-primary">
      {/* 侧边栏 */}
      <div className="w-64 bg-secondary border-r border-border-primary shadow-sm">
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] select-none">Dev Tools</h1>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <p className="text-sm text-[var(--text-secondary)] select-none">开发工具集</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 select-none">v{version}</p>
        </div>
        <nav className="p-4">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors select-none ${
                activeTool === tool.id
                  ? 'bg-active-bg text-active-text font-medium'
                  : 'text-[var(--text-primary)] hover:bg-hover'
              }`}
            >
              <span className="text-xl select-none">{tool.icon}</span>
              <span className="select-none">{tool.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="w-full p-8 h-full flex flex-col">
            {/* 渲染所有工具组件，但只显示当前激活的工具 */}
            <div className={activeTool === 'json' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <JsonTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'base64' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <Base64Tool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'timestamp' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <TimestampTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'uuid' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <UuidTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'url' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <UrlTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'qrcode' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <QrcodeTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'ipquery' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
              <IPQueryTool onShowHelp={handleShowHelp} />
            </div>
            <div className={activeTool === 'help' ? '' : 'hidden'}>
              <HelpTool scrollToToolId={helpToolId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

