import { useState, useEffect, useRef, useCallback } from 'react'
import { searchTools } from '../utils/toolSearch'
import { TOOLS } from '../constants/tools'

/**
 * 工具搜索 Hook
 * 负责搜索状态管理、键盘事件处理和双击 Shift 检测
 */
export function useToolSearch(onSelectTool) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // 双击 Shift 检测
  const lastShiftTimeRef = useRef(0)
  const SHIFT_DOUBLE_CLICK_TIMEOUT = 500 // 500ms 内的两次 Shift 视为双击

  // 搜索匹配结果
  const matchedResults = searchQuery.trim() 
    ? searchTools(searchQuery, TOOLS)
    : []

  // 当搜索词变化时，重置选中索引
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // 双击 Shift 检测
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 如果搜索框已打开，不处理双击 Shift
      if (isOpen) return

      // 检测 Shift 键（使用 keyCode 或 key）
      const isShift = e.key === 'Shift' || e.keyCode === 16
      
      if (isShift && !e.repeat) {
        const now = Date.now()
        const timeSinceLastShift = now - lastShiftTimeRef.current

        // 如果在时间窗口内，认为是双击
        if (timeSinceLastShift < SHIFT_DOUBLE_CLICK_TIMEOUT && timeSinceLastShift > 0) {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
          lastShiftTimeRef.current = 0 // 重置，避免连续触发
        } else {
          lastShiftTimeRef.current = now
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen])

  // 处理键盘事件
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (matchedResults.length === 0) return 0
          return (prev + 1) % matchedResults.length
        })
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => {
          if (matchedResults.length === 0) return 0
          return (prev - 1 + matchedResults.length) % matchedResults.length
        })
        break

      case 'Enter':
        e.preventDefault()
        if (matchedResults.length > 0 && matchedResults[selectedIndex]) {
          const selectedTool = matchedResults[selectedIndex].tool
          onSelectTool(selectedTool.id)
          setIsOpen(false)
          setSearchQuery('')
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
        break

      default:
        break
    }
  }, [isOpen, matchedResults, selectedIndex, onSelectTool])

  // 全局键盘事件监听
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])

  // 选择工具
  const selectTool = useCallback((toolId) => {
    onSelectTool(toolId)
    setIsOpen(false)
    setSearchQuery('')
  }, [onSelectTool])

  // 打开搜索
  const openSearch = useCallback(() => {
    setIsOpen(true)
  }, [])

  // 关闭搜索
  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
  }, [])

  return {
    isOpen,
    searchQuery,
    setSearchQuery,
    matchedResults,
    selectedIndex,
    selectTool,
    openSearch,
    closeSearch,
  }
}

