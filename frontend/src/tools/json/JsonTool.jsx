import React, { useState, useEffect, useRef, useCallback } from 'react'
import JsonFormatter from './JsonFormatter'
import ToolHeader from '../../components/ToolHeader'

function JsonTool({ onShowHelp, isActive }) {
  // Tab 数据结构：{ id: string, name: string }
  const [tabs, setTabs] = useState([{ id: `tab-${Date.now()}`, name: 'JSON 1' }])
  const [activeTabId, setActiveTabId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const tabCounterRef = useRef(1) // 用于自动命名

  // 初始化：设置第一个 tab 为激活状态
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id)
    }
  }, [tabs, activeTabId])

  // 生成下一个 tab 名称
  const getNextTabName = useCallback(() => {
    tabCounterRef.current += 1
    return `JSON ${tabCounterRef.current}`
  }, [])

  // 添加新 Tab
  const handleAddTab = useCallback(() => {
    if (tabs.length >= 20) {
      return // 最大 20 个 tab
    }
    const newTab = {
      id: `tab-${Date.now()}-${Math.random()}`,
      name: getNextTabName(),
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [tabs.length, getNextTabName])

  // 切换 Tab
  const handleSwitchTab = useCallback((tabId) => {
    setActiveTabId(tabId)
    setEditingTabId(null) // 取消编辑状态
  }, [])

  // 关闭 Tab
  const handleCloseTab = useCallback(
    (tabId, e) => {
      if (e) {
        e.stopPropagation() // 阻止触发切换事件
      }
      if (tabs.length <= 1) {
        return // 至少保留一个 tab
      }
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId)
        // 如果关闭的是当前激活的 tab，切换到相邻 tab
        if (tabId === activeTabId) {
          const closedIndex = prev.findIndex((tab) => tab.id === tabId)
          let newActiveIndex
          if (closedIndex < newTabs.length) {
            // 优先切换到右侧
            newActiveIndex = closedIndex
          } else {
            // 如果右侧没有，切换到左侧
            newActiveIndex = closedIndex - 1
          }
          if (newActiveIndex >= 0 && newActiveIndex < newTabs.length) {
            setActiveTabId(newTabs[newActiveIndex].id)
          }
        }
        return newTabs
      })
      setEditingTabId(null) // 取消编辑状态
    },
    [tabs.length, activeTabId]
  )

  // 鼠标中键关闭 Tab
  const handleMouseDown = useCallback(
    (tabId, e) => {
      if (e.button === 1) {
        // 中键
        e.preventDefault()
        handleCloseTab(tabId, e)
      }
    },
    [handleCloseTab]
  )

  // 开始重命名
  const handleStartRename = useCallback((tabId, currentName, e) => {
    e.stopPropagation() // 阻止切换 tab
    setEditingTabId(tabId)
    setEditingName(currentName)
  }, [])

  // 确认重命名
  const handleConfirmRename = useCallback(
    (tabId, e) => {
      if (e.key === 'Enter') {
        const trimmedName = editingName.trim()
        if (trimmedName) {
          setTabs((prev) =>
            prev.map((tab) => (tab.id === tabId ? { ...tab, name: trimmedName } : tab))
          )
        }
        setEditingTabId(null)
        setEditingName('')
      } else if (e.key === 'Escape') {
        setEditingTabId(null)
        setEditingName('')
      }
    },
    [editingName]
  )

  // 快捷键处理
  useEffect(() => {
    if (!isActive) return // 仅在 JSON 工具激活时响应

    const handleKeyDown = (e) => {
      // 检查焦点是否在应用内（允许输入框聚焦时也响应）
      const activeElement = document.activeElement
      if (!activeElement) {
        return
      }

      // 如果正在编辑 tab 名称，不响应快捷键（除了 ESC）
      if (editingTabId) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isCtrl = isMac ? e.metaKey : e.ctrlKey
      const isShift = e.shiftKey

      // Cmd+W / Ctrl+W：关闭当前 tab
      if (isCtrl && !isShift && e.key === 'w') {
        e.preventDefault()
        e.stopPropagation()
        if (activeTabId && tabs.length > 1) {
          handleCloseTab(activeTabId)
        }
        return
      }

      // Ctrl+Tab：切换到下一个 tab
      if (e.ctrlKey && !isShift && e.key === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId)
          const nextIndex = (currentIndex + 1) % tabs.length
          setActiveTabId(tabs[nextIndex].id)
        }
        return
      }

      // Ctrl+Shift+Tab：切换到上一个 tab
      if (e.ctrlKey && isShift && e.key === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId)
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
          setActiveTabId(tabs[prevIndex].id)
        }
        return
      }

      // Cmd+T / Ctrl+T：创建新 tab
      if (isCtrl && !isShift && e.key === 't') {
        e.preventDefault()
        e.stopPropagation()
        if (tabs.length < 20) {
          handleAddTab()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isActive, activeTabId, tabs, handleCloseTab, editingTabId, handleAddTab])

  return (
    <div className="h-full flex flex-col">
      <ToolHeader
        title="JSON 工具"
        description="格式化、验证和转换 JSON 数据"
        toolId="json"
        onShowHelp={onShowHelp}
      />
      {/* Tab 列表 */}
      <div className="border-b border-border-primary bg-secondary relative h-10 overflow-hidden">
        <div className="flex items-end flex-nowrap h-full overflow-x-auto tab-scroll-container pr-12">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-4 py-2 transition-all cursor-pointer select-none flex-shrink-0 whitespace-nowrap relative h-full ${
                activeTabId === tab.id
                  ? 'text-active-text rounded-t-lg border-t border-l border-r border-border-primary shadow-sm z-10 mb-[-1px]'
                  : 'text-[var(--text-primary)] rounded-t-lg border-t border-l border-r border-transparent hover:border-border-primary'
              }`}
              onClick={() => handleSwitchTab(tab.id)}
              onMouseDown={(e) => handleMouseDown(tab.id, e)}
            >
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => handleConfirmRename(tab.id, e)}
                onBlur={() => {
                  const trimmedName = editingName.trim()
                  if (trimmedName) {
                    setTabs((prev) =>
                      prev.map((t) => (t.id === tab.id ? { ...t, name: trimmedName } : t))
                    )
                  }
                  setEditingTabId(null)
                  setEditingName('')
                }}
                className="px-1 py-0 text-sm bg-input border border-border-input rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[60px] max-w-[200px]"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span
                  className="text-sm mr-2"
                  onDoubleClick={(e) => handleStartRename(tab.id, tab.name, e)}
                >
                  {tab.name}
                </span>
                {tabs.length > 1 && (
                  <button
                    className="ml-1 p-0.5 rounded hover:opacity-70 transition-opacity"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </>
            )}
            </div>
          ))}
        </div>
        {/* 固定在右侧的添加按钮 */}
        {tabs.length < 20 && (
          <button
            className="absolute right-0 top-0 bottom-0 px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors select-none flex items-center bg-secondary border-l border-border-primary z-20"
            onClick={handleAddTab}
            title="添加新 Tab (Cmd+T / Ctrl+T)"
          >
            +
          </button>
        )}
      </div>
      {/* Tab 内容区域 */}
      <div className="flex-1 min-h-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTabId === tab.id ? 'h-full' : 'hidden'}
          >
            <JsonFormatter isActive={activeTabId === tab.id && isActive} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default JsonTool
