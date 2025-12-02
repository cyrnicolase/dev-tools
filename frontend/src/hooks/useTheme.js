import { useState, useEffect, useCallback } from 'react'
import { waitForWailsAPI, getWailsAPI } from '../utils/api'
import { loadTheme, getDefaultTheme } from '../utils/theme'

/**
 * 主题管理 Hook
 * 负责主题的加载、切换和持久化
 */
export function useTheme() {
  const [theme, setTheme] = useState(getDefaultTheme())
  const [apiReady, setApiReady] = useState(false)

  // 初始化主题（从后端加载）
  useEffect(() => {
    waitForWailsAPI()
      .then((api) => {
        setApiReady(true)
        if (api.GetTheme) {
          api.GetTheme()
            .then((t) => {
              if (t && (t === 'light' || t === 'dark')) {
                setTheme(t)
                loadTheme(t)
              } else {
                const defaultTheme = getDefaultTheme()
                setTheme(defaultTheme)
                loadTheme(defaultTheme)
              }
            })
            .catch(() => {
              const defaultTheme = getDefaultTheme()
              setTheme(defaultTheme)
              loadTheme(defaultTheme)
            })
        } else {
          const defaultTheme = getDefaultTheme()
          setTheme(defaultTheme)
          loadTheme(defaultTheme)
        }
      })
      .catch(() => {
        const defaultTheme = getDefaultTheme()
        setTheme(defaultTheme)
        loadTheme(defaultTheme)
      })
  }, [])

  // 切换主题
  const toggleTheme = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
      loadTheme(nextTheme)
      return nextTheme
    })
  }, [])

  // 保存主题到后端
  useEffect(() => {
    if (apiReady && theme) {
      const api = getWailsAPI()
      if (api?.SetTheme) {
        api.SetTheme(theme).catch(() => {
          // 忽略错误
        })
      }
    }
  }, [theme, apiReady])

  return {
    theme,
    toggleTheme,
    apiReady,
  }
}

