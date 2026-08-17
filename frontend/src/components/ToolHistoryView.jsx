import React from 'react'

function renderMap(mapValue) {
  if (!mapValue || typeof mapValue !== 'object') {
    return '—'
  }
  const entries = Object.entries(mapValue)
  if (entries.length === 0) {
    return '—'
  }
  return entries.map(([key, value]) => `${key}: ${value || '—'}`).join('\n')
}

function ToolHistoryView({ title, records, maxItems = 50 }) {
  return (
    <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 select-none">
        {title}（最近 {maxItems} 条）
      </h3>
      {records.length === 0 ? (
        <div className="p-3 bg-input-disabled border border-border-input rounded-lg text-sm text-[var(--text-secondary)] select-none">
          暂无历史记录，成功执行后会展示在这里
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {records.map((record) => (
            <div key={record.id} className="p-3 bg-secondary border border-border-primary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)] select-none">{record.action}</span>
                <span className="text-xs text-[var(--text-secondary)] select-none">
                  {new Date(record.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] select-none mb-1">输入</div>
              <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all bg-input-disabled border border-border-input rounded p-2 mb-2">
                {renderMap(record.input)}
              </pre>
              <div className="text-xs text-[var(--text-secondary)] select-none mb-1">输出</div>
              <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all bg-input-disabled border border-border-input rounded p-2">
                {renderMap(record.output)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ToolHistoryView
