import React, { useState, useEffect } from 'react'
import ThemeToggle from './components/ThemeToggle'
import { waitForWailsAPI, getWailsAPI } from './utils/api'
import { useTheme } from './hooks/useTheme'
import { useToolNavigation } from './hooks/useToolNavigation'
import { TOOLS, VIEW_IDS } from './constants/tools'
import { normalizeToolID, isValidToolID } from './utils/toolUtils'
import { TOOL_COMPONENTS } from './config/toolComponents'

function App() {
  const [version, setVersion] = useState('1.1.0')
  const [apiReady, setApiReady] = useState(false)
  const [initialToolHandled, setInitialToolHandled] = useState(false)
  const [helpToolId, setHelpToolId] = useState(null)
  const { theme, toggleTheme } = useTheme()
  
  // 使用工具导航 Hook
  const { activeTool, switchToTool } = useToolNavigation(apiReady, initialToolHandled)

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
              if (toolName) {
                const normalized = normalizeToolID(toolName)
                if (isValidToolID(normalized)) {
                  switchToTool(normalized)
                  setTimeout(() => {
                    if (api.ClearInitialTool) {
                      api.ClearInitialTool().catch(() => {})
                    }
                  }, 100)
                } else if (api.ClearInitialTool) {
                  api.ClearInitialTool().catch(() => {})
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


  // 处理跳转到帮助页面的特定工具介绍
  const handleShowHelp = (toolId) => {
    setHelpToolId(toolId)
    switchToTool('help')
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
              onClick={() => switchToTool(tool.id)}
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
            {Object.entries(TOOL_COMPONENTS).map(([toolID, config]) => {
              const ToolComponent = config.component
              const isActive = activeTool === toolID
              const className = isActive ? config.className : 'hidden'
              
              return (
                <div key={toolID} className={className}>
                  {toolID === 'help' ? (
                    <ToolComponent scrollToToolId={helpToolId} />
                  ) : (
                    <ToolComponent onShowHelp={handleShowHelp} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

