import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime'
import Select from '../../components/Select'
import Toast from '../../components/Toast'
import { validateProviderConfig } from '../../utils/translateConfigValidator'

function TranslateConfig({ onClose }) {
  const [api, setApi] = useState(null)
  const [providers, setProviders] = useState([])
  const [defaultProvider, setDefaultProvider] = useState('youdao')
  const [selectedProvider, setSelectedProvider] = useState('youdao')
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.Translate) {
          setApi(wailsAPI)
          loadConfig(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const loadConfig = async (wailsAPI) => {
    try {
      setLoading(true)
      setError('')

      // 获取支持的提供商列表
      const providersJson = await wailsAPI.Translate.GetProviders()
      const providersList = JSON.parse(providersJson)
      setProviders(providersList)

      // 获取默认提供商
      const defaultProviderValue = await wailsAPI.Translate.GetDefaultProvider()
      setDefaultProvider(defaultProviderValue)
      setSelectedProvider(defaultProviderValue)

      // 加载当前提供商的配置
      await loadProviderConfig(wailsAPI, defaultProviderValue)
    } catch (err) {
      setError(err.message || '加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const loadProviderConfig = async (wailsAPI, provider) => {
    try {
      const configJson = await wailsAPI.Translate.GetProviderConfig(provider)
      const configData = JSON.parse(configJson)
      setConfig(configData)
    } catch (err) {
      setConfig({})
    }
  }

  const handleProviderChange = async (provider) => {
    setSelectedProvider(provider)
    const wailsAPI = api || getWailsAPI()
    if (wailsAPI?.Translate) {
      await loadProviderConfig(wailsAPI, provider)
    }
  }

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Translate) {
        setError('后端 API 未加载，请稍候重试')
        setSaving(false)
        return
      }

      // 验证配置
      const validation = validateProviderConfig(selectedProvider, config)
      if (!validation.valid) {
        setError(validation.error)
        setSaving(false)
        return
      }

      // 保存配置
      const configJson = JSON.stringify(config)
      await wailsAPI.Translate.SaveProviderConfig(selectedProvider, configJson)

      // 如果更改了默认提供商，也更新默认提供商
      if (selectedProvider !== defaultProvider) {
        await wailsAPI.Translate.SetDefaultProvider(selectedProvider)
        setDefaultProvider(selectedProvider)
      }

      setSuccess('保存成功')
      setSaving(false)
      
      // 显示Toast提示
      setToastMessage('保存成功')
      setShowToast(true)
      
      // 延迟关闭配置面板
      setTimeout(() => {
        setSuccess('')
        if (onClose) {
          onClose()
        }
      }, 1500)
    } catch (err) {
      setError(err.message || '保存配置失败')
      setSaving(false)
    }
  }

  return (
    <div className="bg-secondary rounded-lg border border-border-primary p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">
          翻译配置
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--text-secondary)] select-none">
          加载配置中...
        </div>
      ) : (
        <div className="space-y-4">
          {/* 提供商选择 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">
              翻译提供商
            </label>
            <Select
              value={selectedProvider}
              onChange={handleProviderChange}
              options={providers.map((provider) => ({
                value: provider,
                label: provider === 'youdao' ? '有道翻译' : provider,
              }))}
              className="w-full"
            />
          </div>

          {/* 有道翻译配置 */}
          {selectedProvider === 'youdao' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">
                  App Key
                </label>
                <input
                  type="text"
                  value={config.appKey || ''}
                  onChange={(e) => handleConfigChange('appKey', e.target.value)}
                  className="w-full p-3 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入有道翻译 App Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">
                  App Secret
                </label>
                <input
                  type="password"
                  value={config.appSecret || ''}
                  onChange={(e) => handleConfigChange('appSecret', e.target.value)}
                  className="w-full p-3 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入有道翻译 App Secret"
                />
              </div>
              <div className="text-sm text-[var(--text-secondary)] select-none">
                <p>获取 API 密钥：</p>
                <p className="mt-1">
                  访问{' '}
                  <button
                    type="button"
                    onClick={() => BrowserOpenURL('https://ai.youdao.com/')}
                    className="text-link hover:underline cursor-pointer"
                  >
                    有道智云
                  </button>
                  {' '}注册并创建应用，获取 App Key 和 App Secret
                </p>
              </div>
            </div>
          )}

          {/* 其他提供商配置（预留） */}
          {selectedProvider !== 'youdao' && (
            <div className="text-sm text-[var(--text-secondary)] select-none">
              该提供商尚未实现
            </div>
          )}

          {/* 错误和成功提示 */}
          {error && (
            <div className="p-3 rounded-lg bg-error-bg text-error-text select-none">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 select-none">
              {success}
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex justify-end space-x-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border-input rounded-lg text-[var(--text-primary)] hover:bg-hover transition-colors select-none"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default TranslateConfig


