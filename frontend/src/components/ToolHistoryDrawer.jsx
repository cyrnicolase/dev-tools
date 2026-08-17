import React from 'react'

function renderMap(mapValue, toolId, section) {
  if (!mapValue || typeof mapValue !== 'object') {
    return '—'
  }
  const entries = Object.entries(mapValue)
  if (entries.length === 0) {
    return '—'
  }
  if (toolId === 'url') {
    return Object.values(mapValue).join('\n')
  }
  if (toolId === 'translate' && section === 'output') {
    return Object.values(mapValue).join('\n')
  }
  if (toolId === 'hash' && section === 'output') {
    return Object.values(mapValue).join('\n')
  }
  if (toolId === 'randomstring' && section === 'output') {
    return Object.values(mapValue).join('\n')
  }
  if (toolId === 'uuid' && section === 'output') {
    return Object.values(mapValue).join('\n')
  }
  return entries.map(([key, value]) => `${key}: ${value || '—'}`).join('\n')
}

function ToolHistoryDrawer({
  title,
  records,
  maxItems = 50,
  isOpen,
  onClose,
  panelRef,
}) {
  return (
    <div
      ref={panelRef}
      className={`absolute inset-y-0 right-0 z-20 w-[420px] max-w-full border-l border-border-primary bg-secondary shadow-xl transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <h3 className="text-base font-semibold text-[var(--text-primary)] select-none">
            {title}（最近 {maxItems} 条）
          </h3>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
            title="关闭历史面板"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="p-3 bg-input-disabled border border-border-input rounded-lg text-sm text-[var(--text-secondary)] select-none">
              暂无历史记录，成功执行后会展示在这里
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="p-3 bg-secondary border border-border-primary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] select-none">{record.action}</span>
                  <span className="text-xs text-[var(--text-secondary)] select-none">
                    {new Date(record.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] select-none mb-1">输入</div>
                <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all bg-input-disabled border border-border-input rounded p-2 mb-2">
                  {renderMap(record.input, record.toolId, 'input')}
                </pre>
                <div className="text-xs text-[var(--text-secondary)] select-none mb-1">输出</div>
                <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all bg-input-disabled border border-border-input rounded p-2">
                  {renderMap(record.output, record.toolId, 'output')}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ToolHistoryDrawer
