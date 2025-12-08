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
  const [version, setVersion] = useState('1.2.1')
  const lastCheckedToolRef = useRef('')

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

  // 切换工具的内部函数
  const handleToolSwitch = useCallback((toolID) => {
    const normalized = normalizeToolID(toolID)
    if (!isValidToolID(normalized)) {
      return false
    }
    
    setActiveTool((currentTool) => {
      if (normalized === currentTool) {
        return currentTool // 避免不必要的更新
      }
      lastCheckedToolRef.current = normalized
      syncBackendState(normalized)
      return normalized
    })
    return true
  }, [syncBackendState])

  // 监听工具变化事件（实时响应）
  useEffect(() => {
    if (!apiReady || !initialToolHandled) return

    const unsubscribe = EventsOn('tool-changed', (toolID) => {
      if (toolID && typeof toolID === 'string') {
        handleToolSwitch(toolID)
      }
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [apiReady, initialToolHandled, handleToolSwitch])

  // 轮询机制作为备用（用于处理外部调用，如 Alfred）
  useEffect(() => {
    if (!apiReady || !initialToolHandled) return

    const checkToolChange = async () => {
      const api = getWailsAPI()
      if (api?.GetInitialTool) {
        try {
          const toolName = await api.GetInitialTool()
          if (toolName && toolName.trim() !== '') {
            const normalized = normalizeToolID(toolName)
            if (
              isValidToolID(normalized) &&
              normalized !== lastCheckedToolRef.current &&
              normalized !== activeTool
            ) {
              handleToolSwitch(normalized)
              if (api.ClearInitialTool) {
                api.ClearInitialTool().catch(() => {})
              }
            }
          }
        } catch (e) {
          // 静默失败，不影响用户体验
        }
      }
    }

    // 降低轮询频率（每 2 秒检查一次，主要用于外部调用）
    const interval = setInterval(checkToolChange, 2000)
    return () => clearInterval(interval)
  }, [apiReady, initialToolHandled, activeTool, handleToolSwitch])

  // 手动切换工具的函数
  const switchToTool = useCallback((toolID) => {
    const normalized = normalizeToolID(toolID)
    if (!isValidToolID(normalized)) {
      return false
    }
    
    setActiveTool((currentTool) => {
      if (normalized === currentTool) {
        return currentTool
      }
      lastCheckedToolRef.current = normalized
      if (apiReady) {
        syncBackendState(normalized)
      }
      return normalized
    })
    return true
  }, [apiReady, syncBackendState])

  // 应用初始化逻辑
  useEffect(() => {
    waitForWailsAPI()
      .then((api) => {
        setApiReady(true)
        
        // 获取版本号
        if (api.GetVersion) {
          api.GetVersion()
            .then((v) => {
              if (v) setVersion(v)
            })
            .catch(() => {
              // 静默失败
            })
        }
        
        // 获取启动时指定的工具名称（只在启动时检查一次）
        if (api.GetInitialTool && !initialToolHandled) {
          api.GetInitialTool()
            .then((toolName) => {
              if (toolName) {
                const normalized = normalizeToolID(toolName)
                if (isValidToolID(normalized)) {
                  switchToTool(normalized)
                  setTimeout(() => {
                    if (api.ClearInitialTool) {
                      api.ClearInitialTool().catch(() => {})
                    }
                  }, 100)
                } else if (api.ClearInitialTool) {
                  api.ClearInitialTool().catch(() => {})
                }
              }
              setInitialToolHandled(true)
            })
            .catch(() => {
              setInitialToolHandled(true)
            })
        } else {
          setInitialToolHandled(true)
        }
      })
      .catch(() => {
        // 静默失败
      })
  }, [initialToolHandled, switchToTool])

  return {
    activeTool,
    switchToTool,
    version,
  }
}

