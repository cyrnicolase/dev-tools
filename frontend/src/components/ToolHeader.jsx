import React from 'react'

function ToolHeader({ title, description, toolId, onShowHelp }) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] select-none">{title}</h2>
            <button
              onClick={() => onShowHelp && onShowHelp(toolId)}
              className="inline-flex items-center justify-center w-6 h-6 text-link hover:text-[var(--link)] hover:bg-hover rounded transition-colors select-none"
              title="查看使用说明"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-sm select-none">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default ToolHeader

