import React, { useState, useRef, useEffect } from 'react'

function Select({ value, onChange, options, className = '', placeholder = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const selectRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        updatePosition()
      }, 0)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updatePosition()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  const updatePosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      // 估算下拉菜单高度（每个选项约40px高度 + padding）
      const estimatedItemHeight = 40
      const estimatedPadding = 8
      const dropdownHeight = Math.min(options.length * estimatedItemHeight + estimatedPadding, 200)
      
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // 如果下方空间不足，且上方空间足够，则向上弹出
      const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
      
      // 计算左侧位置，确保不会超出窗口右边界
      let left = rect.left
      const dropdownWidth = rect.width
      const maxLeft = window.innerWidth - dropdownWidth - 8 // 留8px边距
      if (left > maxLeft) {
        left = maxLeft
      }
      if (left < 8) {
        left = 8 // 留8px左边距
      }
      
      setPosition({
        top: shouldOpenUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: left,
        width: dropdownWidth,
      })
    }
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* 触发器按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full px-4 py-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer flex items-center justify-between ${
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
      >
        <span className="text-[var(--text-primary)]">{selectedOption?.label || placeholder}</span>
        <svg
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉选项 */}
          <div
            ref={dropdownRef}
            className="fixed z-50 bg-secondary border border-border-primary rounded-lg shadow-xl overflow-hidden select-dropdown"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            <div className="py-1">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2.5 text-sm text-left text-[var(--text-primary)] hover:bg-hover transition-colors ${
                    value === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : ''
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  <span className="block truncate">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Select

