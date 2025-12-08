import React, { useEffect, useRef } from 'react'

/**
 * 工具搜索栏组件
 * 显示搜索输入框和匹配结果列表
 */
function ToolSearchBar({
  isOpen,
  searchQuery,
  setSearchQuery,
  matchedResults,
  selectedIndex,
  onSelectTool,
  onClose,
}) {
  const inputRef = useRef(null)

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 搜索框容器 */}
      <div className="relative w-full max-w-2xl mx-4">
        {/* 搜索输入框 */}
        <div className="bg-secondary border border-border-primary rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--text-secondary)] mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具... (支持模糊匹配，如: b*4, base)"
              className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-lg"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 p-1 rounded hover:bg-hover transition-colors"
                title="清空"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[var(--text-secondary)]"
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
          </div>

          {/* 匹配结果列表 */}
          {searchQuery.trim() && (
            <div className="max-h-96 overflow-y-auto">
              {matchedResults.length > 0 ? (
                <div className="py-2">
                  {matchedResults.map((result, index) => {
                    const { tool, matchResult } = result
                    const isSelected = index === selectedIndex

                    return (
                      <div
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-active-bg text-active-text'
                            : 'hover:bg-hover text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">
                              {tool.name}
                            </div>
                            {tool.id !== tool.name.toLowerCase() && (
                              <div className="text-sm text-[var(--text-secondary)] mt-1">
                                {tool.id}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-xs text-[var(--text-secondary)]">
                              按 Enter 选择
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  未找到匹配的工具
                </div>
              )}
            </div>
          )}

          {/* 提示信息 */}
          {!searchQuery.trim() && (
            <div className="px-4 py-3 text-sm text-[var(--text-secondary)] border-t border-border-primary">
              <div className="flex items-center justify-between">
                <span>输入工具名称进行搜索</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-input border border-border-input rounded text-xs">↑↓</kbd>
                    <span>导航</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-input border border-border-input rounded text-xs">Enter</kbd>
                    <span>选择</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-input border border-border-input rounded text-xs">Esc</kbd>
                    <span>关闭</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ToolSearchBar

