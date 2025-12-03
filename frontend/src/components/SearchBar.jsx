import React from 'react'

function SearchBar({
  searchTerm,
  onSearchChange,
  onPrevious,
  onNext,
  onClose,
  matchCount,
  currentMatch,
  caseSensitive,
  onCaseSensitiveChange,
  regex,
  onRegexChange,
  jsonMode,
  onJsonModeChange,
}) {
  return (
    <div className="bg-secondary border border-border-primary rounded-lg p-3 mb-2 shadow-sm">
      <div className="flex items-center space-x-2">
        {/* 搜索输入框 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={jsonMode ? '搜索 JSON 键或值...' : '搜索...'}
            className="w-full px-3 py-1.5 border border-border-input rounded-lg text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* 匹配数量 */}
        {searchTerm && matchCount > 0 && (
          <div className="text-sm text-[var(--text-secondary)] px-2 select-none">
            {currentMatch}/{matchCount}
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevious}
            disabled={!searchTerm || matchCount === 0}
            className="p-1.5 rounded hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="上一个 (Shift+F3)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={!searchTerm || matchCount === 0}
            className="p-1.5 rounded hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="下一个 (F3)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 选项 */}
        <div className="flex items-center space-x-3 border-l border-border-primary pl-3">
          <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => onCaseSensitiveChange(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-border-input rounded focus:ring-blue-500"
            />
            <span>Aa</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={regex}
              onChange={(e) => onRegexChange(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-border-input rounded focus:ring-blue-500"
            />
            <span>.*</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={jsonMode}
              onChange={(e) => onJsonModeChange(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-border-input rounded focus:ring-blue-500"
            />
            <span>JSON</span>
          </label>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-hover transition-colors"
          title="关闭 (Esc)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SearchBar

