import React, { useState } from 'react'
import ThemeToggle from './components/ThemeToggle'
import ToolSearchBar from './components/ToolSearchBar'
import { useTheme } from './hooks/useTheme'
import { useToolNavigation } from './hooks/useToolNavigation'
import { useToolSearch } from './hooks/useToolSearch'
import { TOOLS } from './constants/tools'
import { TOOL_COMPONENTS } from './config/toolComponents'

function App() {
  const [helpToolId, setHelpToolId] = useState(null)
  const { theme, toggleTheme } = useTheme()
  
  // 使用工具导航 Hook（包含初始化逻辑）
  const { activeTool, switchToTool, version } = useToolNavigation()

  // 使用工具搜索 Hook
  const {
    isOpen: isSearchOpen,
    searchQuery,
    setSearchQuery,
    matchedResults,
    selectedIndex,
    selectTool: selectToolFromSearch,
    closeSearch,
  } = useToolSearch(switchToTool)

  // 处理跳转到帮助页面的特定工具介绍
  const handleShowHelp = (toolId) => {
    setHelpToolId(toolId)
    switchToTool('help')
  }

  return (
    <div className="flex h-screen bg-primary">
      {/* 工具搜索栏 */}
      <ToolSearchBar
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        matchedResults={matchedResults}
        selectedIndex={selectedIndex}
        onSelectTool={selectToolFromSearch}
        onClose={closeSearch}
      />

      {/* 侧边栏 */}
      <div className="w-64 bg-secondary border-r border-border-primary shadow-sm">
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] select-none">Dev Tools</h1>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)] select-none">开发工具集</p>
            <p className="text-xs text-[var(--text-tertiary)] select-none">v{version}</p>
          </div>
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
                    <ToolComponent onShowHelp={handleShowHelp} isActive={isActive} />
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

