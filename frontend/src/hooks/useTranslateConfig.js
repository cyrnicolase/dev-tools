import { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../utils/api'

/**
 * 自定义Hook：管理翻译配置
 * @returns {Object} 配置相关的状态和方法
 */
export function useTranslateConfig() {
  const [api, setApi] = useState(null)
  const [configChecked, setConfigChecked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.Translate) {
          setApi(wailsAPI)
          checkConfig(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  /**
   * 检查配置是否完整
   */
  const checkConfig = async (wailsAPI) => {
    try {
      const defaultProvider = await wailsAPI.Translate.GetDefaultProvider()
      const configJson = await wailsAPI.Translate.GetProviderConfig(defaultProvider)
      const config = JSON.parse(configJson)
      
      // 检查配置是否完整
      if (defaultProvider === 'youdao') {
        if (config.appKey && config.appSecret) {
          setConfigChecked(true)
        }
      }
    } catch (err) {
      // 配置检查失败不影响使用，静默处理
      setConfigChecked(false)
    }
  }

  /**
   * 重新检查配置
   */
  const refreshConfig = async () => {
    const wailsAPI = api || getWailsAPI()
    if (wailsAPI?.Translate) {
      await checkConfig(wailsAPI)
    }
  }

  return {
    api,
    configChecked,
    error,
    checkConfig: refreshConfig,
  }
}

