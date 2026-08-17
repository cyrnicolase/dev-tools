import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import JsonFormatter from './JsonFormatter'
import ToolHeader from '../../components/ToolHeader'

function getPinOrder(tab) {
  return typeof tab.pinOrder === 'number' ? tab.pinOrder : Number.MAX_SAFE_INTEGER
}

function getSortedTabs(tabList) {
  return [...tabList].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }
    if (a.pinned) {
      return getPinOrder(a) - getPinOrder(b)
    }
    return a.baseIndex - b.baseIndex
  })
}

function compactTabOrder(tabList) {
  const sortedPinned = tabList
    .filter((tab) => tab.pinned)
    .sort((a, b) => getPinOrder(a) - getPinOrder(b))
  const pinOrderMap = new Map()
  sortedPinned.forEach((tab, index) => {
    pinOrderMap.set(tab.id, index)
  })

  const sortedUnpinned = tabList
    .filter((tab) => !tab.pinned)
    .sort((a, b) => a.baseIndex - b.baseIndex)
  const baseIndexMap = new Map()
  sortedUnpinned.forEach((tab, index) => {
    baseIndexMap.set(tab.id, index)
  })

  return tabList.map((tab) => {
    if (tab.pinned) {
      return { ...tab, pinOrder: pinOrderMap.get(tab.id) ?? 0 }
    }
    return { ...tab, baseIndex: baseIndexMap.get(tab.id) ?? tab.baseIndex, pinOrder: null }
  })
}

function getNextUnpinnedBaseIndex(tabList) {
  const unpinned = tabList.filter((tab) => !tab.pinned)
  return unpinned.reduce((maxIndex, tab) => Math.max(maxIndex, tab.baseIndex), -1) + 1
}

function getNextPinOrder(tabList) {
  const pinned = tabList.filter((tab) => tab.pinned)
  return pinned.reduce((maxOrder, tab) => Math.max(maxOrder, getPinOrder(tab)), -1) + 1
}

function reorderTabsByIds(sortedGroup, fromId, toId) {
  const fromIndex = sortedGroup.findIndex((tab) => tab.id === fromId)
  const toIndex = sortedGroup.findIndex((tab) => tab.id === toId)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return sortedGroup
  }

  const next = [...sortedGroup]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function reorderWithinGroup(tabList, draggedTabId, targetTabId) {
  const draggedTab = tabList.find((tab) => tab.id === draggedTabId)
  const targetTab = tabList.find((tab) => tab.id === targetTabId)
  if (!draggedTab || !targetTab || draggedTab.pinned !== targetTab.pinned) {
    return tabList
  }

  if (draggedTab.pinned) {
    const pinnedTabs = tabList
      .filter((tab) => tab.pinned)
      .sort((a, b) => getPinOrder(a) - getPinOrder(b))
    const reorderedPinned = reorderTabsByIds(pinnedTabs, draggedTabId, targetTabId)
    const pinOrderMap = new Map()
    reorderedPinned.forEach((tab, index) => {
      pinOrderMap.set(tab.id, index)
    })
    return tabList.map((tab) =>
      tab.pinned ? { ...tab, pinOrder: pinOrderMap.get(tab.id) ?? getPinOrder(tab) } : tab
    )
  }

  const unpinnedTabs = tabList
    .filter((tab) => !tab.pinned)
    .sort((a, b) => a.baseIndex - b.baseIndex)
  const reorderedUnpinned = reorderTabsByIds(unpinnedTabs, draggedTabId, targetTabId)
  const baseIndexMap = new Map()
  reorderedUnpinned.forEach((tab, index) => {
    baseIndexMap.set(tab.id, index)
  })
  return tabList.map((tab) =>
    tab.pinned ? tab : { ...tab, baseIndex: baseIndexMap.get(tab.id) ?? tab.baseIndex }
  )
}

function JsonTool({ onShowHelp, isActive }) {
  // Tab 数据结构：{ id: string, name: string, pinned: boolean, baseIndex: number, pinOrder: number|null }
  const [tabs, setTabs] = useState([
    { id: `tab-${Date.now()}`, name: 'JSON 1', pinned: false, baseIndex: 0, pinOrder: null },
  ])
  const [activeTabId, setActiveTabId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [draggingTabId, setDraggingTabId] = useState(null)
  const [dragOverTabId, setDragOverTabId] = useState(null)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    tabId: null,
  })
  const tabCounterRef = useRef(1) // 用于自动命名
  const sortedTabs = useMemo(() => getSortedTabs(tabs), [tabs])

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

    const nextBaseIndex = getNextUnpinnedBaseIndex(tabs)
    const newTab = {
      id: `tab-${Date.now()}-${Math.random()}`,
      name: getNextTabName(),
      pinned: false,
      baseIndex: nextBaseIndex,
      pinOrder: null,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [tabs, getNextTabName])

  // 切换 Tab
  const handleSwitchTab = useCallback((tabId) => {
    setActiveTabId(tabId)
    setEditingTabId(null) // 取消编辑状态
    setContextMenu((prev) => ({ ...prev, visible: false, tabId: null }))
  }, [])

  // 右键菜单：打开
  const handleOpenContextMenu = useCallback((tabId, event) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      tabId,
    })
  }, [])

  // 右键菜单：关闭
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.visible ? { ...prev, visible: false, tabId: null } : prev))
  }, [])

  // Pin/Unpin 操作
  const handleTogglePin = useCallback(() => {
    if (!contextMenu.tabId) {
      return
    }

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === contextMenu.tabId
          ? {
              ...tab,
              pinned: !tab.pinned,
              pinOrder: tab.pinned ? null : getNextPinOrder(prev),
            }
          : tab
      )
    )
    closeContextMenu()
  }, [contextMenu.tabId, closeContextMenu])

  // 关闭 Tab
  const handleCloseTab = useCallback(
    (tabId, e) => {
      if (e) {
        e.stopPropagation() // 阻止触发切换事件
      }
      if (tabs.length <= 1) {
        return // 至少保留一个 tab
      }

      const displayedTabs = getSortedTabs(tabs)
      const currentIndex = displayedTabs.findIndex((tab) => tab.id === tabId)
      const fallbackActiveTabId =
        currentIndex >= 0 && currentIndex < displayedTabs.length - 1
          ? displayedTabs[currentIndex + 1].id
          : displayedTabs[currentIndex - 1]?.id || null

      setTabs((prev) => {
        const newTabs = compactTabOrder(prev.filter((tab) => tab.id !== tabId))
        // 如果关闭的是当前激活的 tab，切换到相邻 tab
        if (tabId === activeTabId) {
          if (fallbackActiveTabId) {
            setActiveTabId(fallbackActiveTabId)
          }
        }
        return newTabs
      })
      setEditingTabId(null) // 取消编辑状态
      setDraggingTabId(null)
      setDragOverTabId(null)
      closeContextMenu()
    },
    [tabs, activeTabId, closeContextMenu]
  )

  const handleDragStart = useCallback(
    (tabId, event) => {
      if (editingTabId) {
        event.preventDefault()
        return
      }
      setDraggingTabId(tabId)
      setDragOverTabId(null)
      closeContextMenu()
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', tabId)
    },
    [editingTabId, closeContextMenu]
  )

  const handleDragOver = useCallback(
    (tabId, event) => {
      if (!draggingTabId || draggingTabId === tabId) {
        return
      }
      const draggingTab = tabs.find((tab) => tab.id === draggingTabId)
      const hoverTab = tabs.find((tab) => tab.id === tabId)
      if (!draggingTab || !hoverTab || draggingTab.pinned !== hoverTab.pinned) {
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setDragOverTabId(tabId)
    },
    [draggingTabId, tabs]
  )

  const handleDrop = useCallback(
    (tabId, event) => {
      if (!draggingTabId || draggingTabId === tabId) {
        return
      }
      event.preventDefault()
      setTabs((prev) => reorderWithinGroup(prev, draggingTabId, tabId))
      setDraggingTabId(null)
      setDragOverTabId(null)
    },
    [draggingTabId]
  )

  const handleDragEnd = useCallback(() => {
    setDraggingTabId(null)
    setDragOverTabId(null)
  }, [])

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

      if (e.key === 'Escape') {
        closeContextMenu()
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
        if (sortedTabs.length > 1 && activeTabId) {
          const currentIndex = sortedTabs.findIndex((tab) => tab.id === activeTabId)
          const nextIndex = (currentIndex + 1) % sortedTabs.length
          setActiveTabId(sortedTabs[nextIndex].id)
        }
        return
      }

      // Ctrl+Shift+Tab：切换到上一个 tab
      if (e.ctrlKey && isShift && e.key === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        if (sortedTabs.length > 1 && activeTabId) {
          const currentIndex = sortedTabs.findIndex((tab) => tab.id === activeTabId)
          const prevIndex = (currentIndex - 1 + sortedTabs.length) % sortedTabs.length
          setActiveTabId(sortedTabs[prevIndex].id)
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
  }, [isActive, activeTabId, tabs.length, sortedTabs, handleCloseTab, editingTabId, handleAddTab, closeContextMenu])

  // 点击空白处关闭右键菜单
  useEffect(() => {
    if (!contextMenu.visible) {
      return undefined
    }

    const handlePointerDown = () => closeContextMenu()
    window.addEventListener('mousedown', handlePointerDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [contextMenu.visible, closeContextMenu])

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
          {sortedTabs.map((tab) => (
            <div
              key={tab.id}
              className={`group flex items-center px-4 py-2 transition-all cursor-pointer select-none flex-shrink-0 whitespace-nowrap relative h-full ${
                activeTabId === tab.id
                  ? 'text-active-text font-semibold bg-[var(--active-bg)] rounded-t-lg shadow-md z-10 mb-[-1px]'
                  : 'text-[var(--text-primary)] rounded-t-lg hover:bg-[var(--hover-bg)]'
              } ${dragOverTabId === tab.id ? 'ring-2 ring-blue-500/60' : ''}`}
              onClick={() => handleSwitchTab(tab.id)}
              onMouseDown={(e) => handleMouseDown(tab.id, e)}
              onContextMenu={(e) => handleOpenContextMenu(tab.id, e)}
              draggable={editingTabId !== tab.id}
              onDragStart={(e) => handleDragStart(tab.id, e)}
              onDragOver={(e) => handleDragOver(tab.id, e)}
              onDrop={(e) => handleDrop(tab.id, e)}
              onDragEnd={handleDragEnd}
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
                {tab.pinned && (
                  <span className="mr-1 text-xs text-[var(--text-secondary)]" title="已固定">
                    📌
                  </span>
                )}
                <span
                  className="text-sm"
                  onDoubleClick={(e) => handleStartRename(tab.id, tab.name, e)}
                >
                  {tab.name}
                </span>
                {tabs.length > 1 && (
                  <button
                    className="absolute top-1 right-1 p-0.5 rounded bg-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity shadow-sm border border-border-primary z-20"
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
      {contextMenu.visible && (
        <div
          className="fixed z-50 min-w-[112px] rounded-md border border-border-primary bg-secondary shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
            onClick={handleTogglePin}
          >
            {tabs.find((tab) => tab.id === contextMenu.tabId)?.pinned ? '取消固定标签' : '固定标签'}
          </button>
        </div>
      )}
      {/* Tab 内容区域 */}
      <div className="flex-1 min-h-0">
        {sortedTabs.map((tab) => (
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
