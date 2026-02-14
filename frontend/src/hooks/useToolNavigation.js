import { useState, useEffect, useRef, useCallback } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../utils/api'
import { EventsOn } from '../../wailsjs/runtime/runtime'
import { normalizeToolID, isValidToolID } from '../utils/toolUtils'
import { DEFAULT_TOOL_ID } from '../constants/tools'

/**
 * 工具导航 Hook
 * 负责工具切换、状态同步、事件监听和应用初始化
 */
export function useToolNavigation() {
  const [activeTool, setActiveTool] = useState(DEFAULT_TOOL_ID)
  const [apiReady, setApiReady] = useState(false)
  const [initialToolHandled, setInitialToolHandled] = useState(false)
  const [version, setVersion] = useState('1.5.2')
  const lastCheckedToolRef = useRef('')
  const processingToolRef = useRef(false) // 防止并发处理同一个工具切换
  const initializationStartedRef = useRef(false) // 跟踪初始化是否已开始

  // 同步后端状态的函数
  const syncBackendState = useCallback((toolID) => {
    if (toolID === 'help') {
      return // 不同步 help 视图
    }
    
    const api = getWailsAPI()
    if (api?.SetCurrentTool) {
      api.SetCurrentTool(toolID).catch(() => {
        // 静默失败，不影响用户体验
      })
    }
  }, [])

  // 切换工具的内部函数（统一入口，防止重复处理）
  const handleToolSwitch = useCallback((toolID, clearInitialTool = false) => {
    const normalized = normalizeToolID(toolID)
    if (!isValidToolID(normalized)) {
      return false
    }
    
    // 防止并发处理同一个工具切换
    if (processingToolRef.current === normalized) {
      return false
    }
    
    setActiveTool((currentTool) => {
      if (normalized === currentTool) {
        return currentTool // 避免不必要的更新
      }
      
      processingToolRef.current = normalized
      lastCheckedToolRef.current = normalized
      syncBackendState(normalized)
      
      // 如果需要清除 initialTool（由事件或初始化触发）
      // 直接检查 API 是否可用，不依赖 apiReady 状态，避免闭包问题
      if (clearInitialTool) {
        const api = getWailsAPI()
        if (api?.ClearInitialTool) {
          api.ClearInitialTool().catch(() => {})
        }
      }
      
      // 清除处理标记（延迟清除，避免快速连续调用）
      setTimeout(() => {
        if (processingToolRef.current === normalized) {
          processingToolRef.current = false
        }
      }, 100)
      
      return normalized
    })
    return true
  }, [syncBackendState])

  // 监听工具变化事件（实时响应）
  // 一旦 API ready 就立即监听，不等待 initialToolHandled，确保能及时响应 URL scheme 调用
  useEffect(() => {
    if (!apiReady) return

    const unsubscribe = EventsOn('tool-changed', (toolID) => {
      if (toolID && typeof toolID === 'string') {
        // 传递 true 表示需要清除 initialTool，避免轮询机制重复处理
        handleToolSwitch(toolID, true)
      }
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [apiReady, handleToolSwitch])

  // 轮询机制作为备用（用于处理外部调用，如 Alfred）
  // 缩短轮询间隔到 500ms，提高响应速度
  // 注意：不依赖 activeTool，避免频繁重新创建轮询
  useEffect(() => {
    if (!apiReady || !initialToolHandled) return

    const checkToolChange = async () => {
      const api = getWailsAPI()
      if (api?.GetInitialTool) {
        try {
          const toolName = await api.GetInitialTool()
          if (toolName && toolName.trim() !== '') {
            const normalized = normalizeToolID(toolName)
            // 检查是否已经处理过，避免重复处理
            if (
              isValidToolID(normalized) &&
              normalized !== lastCheckedToolRef.current &&
              normalized !== processingToolRef.current
            ) {
              // 传递 true 表示需要清除 initialTool
              handleToolSwitch(normalized, true)
            }
          }
        } catch (e) {
          // 静默失败，不影响用户体验
        }
      }
    }

    // 缩短轮询间隔到 500ms，提高响应速度（主要用于事件机制失效时的备用方案）
    const interval = setInterval(checkToolChange, 500)
    return () => clearInterval(interval)
  }, [apiReady, initialToolHandled, handleToolSwitch])

  // 手动切换工具的函数（用户主动切换）
  const switchToTool = useCallback((toolID) => {
    const normalized = normalizeToolID(toolID)
    if (!isValidToolID(normalized)) {
      return false
    }
    
    // 使用统一的处理函数，传递 true 清除 initialTool，防止轮询机制再次切换回来
    return handleToolSwitch(normalized, true)
  }, [handleToolSwitch])

  // 应用初始化逻辑
  useEffect(() => {
    // 防止重复初始化
    if (initializationStartedRef.current) return
    initializationStartedRef.current = true
    
    let cancelled = false
    
    waitForWailsAPI()
      .then((api) => {
        if (cancelled) return
        setApiReady(true)
        
        // 获取版本号
        if (api.GetVersion) {
          api.GetVersion()
            .then((v) => {
              if (!cancelled && v) setVersion(v)
            })
            .catch(() => {
              // 静默失败
            })
        }
        
        // 获取启动时指定的工具名称（只在启动时检查一次）
        // 立即检查，不延迟，确保快速响应 URL scheme 调用
        if (api.GetInitialTool) {
          api.GetInitialTool()
            .then((toolName) => {
              if (cancelled) return
              if (toolName) {
                const normalized = normalizeToolID(toolName)
                if (isValidToolID(normalized)) {
                  // 使用 handleToolSwitch 统一处理，传递 true 清除 initialTool
                  // 注意：这里不直接调用 switchToTool，因为 switchToTool 是给用户手动切换用的
                  handleToolSwitch(normalized, true)
                } else {
                  // 无效的工具名称，清除 initialTool
                  if (api.ClearInitialTool) {
                    api.ClearInitialTool().catch(() => {})
                  }
                }
              }
              setInitialToolHandled(true)
            })
            .catch(() => {
              if (!cancelled) {
                setInitialToolHandled(true)
              }
            })
        } else {
          setInitialToolHandled(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInitialToolHandled(true)
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [handleToolSwitch]) // 依赖 handleToolSwitch，但使用 ref 防止重复执行

  return {
    activeTool,
    switchToTool,
    version,
  }
}

