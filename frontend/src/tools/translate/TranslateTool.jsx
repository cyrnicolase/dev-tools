import React, { useState } from 'react'
import { getWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import Select from '../../components/Select'
import TranslateConfig from './TranslateConfig'
import { useTranslateConfig } from '../../hooks/useTranslateConfig'

// 支持的语言列表
const LANGUAGES = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ko', label: '韩文' },
]

function TranslateTool({ onShowHelp }) {
  const [input, setInput] = useState('')
  const [fromLang, setFromLang] = useState('zh')
  const [toLang, setToLang] = useState('en')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  
  const { api, configChecked, checkConfig } = useTranslateConfig()

  const handleTranslate = async () => {
    try {
      setError('')
      setResult('')
      setLoading(true)

      if (!input.trim()) {
        setError('请输入要翻译的文本')
        setLoading(false)
        return
      }

      // 检查配置
      if (!configChecked) {
        await checkConfig()
        if (!configChecked) {
          setError('请先配置API密钥（点击右上角设置按钮）')
          setLoading(false)
          return
        }
      }

      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Translate) {
        setError('后端 API 未加载，请稍候重试')
        setLoading(false)
        return
      }

      const translated = await wailsAPI.Translate.Translate(input.trim(), fromLang, toLang)
      if (translated) {
        setResult(translated)
      }
    } catch (err) {
      setError(err.message || '翻译失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      if (result) {
        await navigator.clipboard.writeText(result)
        setToastMessage('翻译结果已复制')
        setShowToast(true)
      }
    } catch (err) {
      setError('复制失败')
    }
  }

  const handleSwapLanguages = () => {
    const temp = fromLang
    setFromLang(toLang)
    setToLang(temp)
    // 交换后自动翻译
    if (input.trim() && result) {
      setInput(result)
      setResult('')
      setTimeout(() => {
        handleTranslate()
      }, 100)
    }
  }

  const handleConfigSaved = () => {
    setShowConfig(false)
    checkConfig()
  }

  return (
    <div className="h-full flex flex-col">
      <div>
        <div className="flex items-start justify-between mb-4">
          <ToolHeader
            title="翻译工具"
            description="支持中文、英文、韩文互译"
            toolId="translate"
            onShowHelp={onShowHelp}
          />
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-hover rounded transition-colors select-none"
            title="配置API密钥"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* 配置面板 */}
        {showConfig && (
          <TranslateConfig onClose={handleConfigSaved} />
        )}

        {/* 翻译区域 */}
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          {/* 语言选择 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1">
              <div className="flex-1">
                <Select
                  value={fromLang}
                  onChange={setFromLang}
                  options={LANGUAGES}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleSwapLanguages}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-hover rounded transition-colors flex-shrink-0"
                title="交换语言"
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>

              <div className="flex-1">
                <Select
                  value={toLang}
                  onChange={setToLang}
                  options={LANGUAGES}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={loading}
              className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '翻译中...' : '翻译'}
            </button>
          </div>

          {/* 输入区域 */}
          <div className="mb-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
              placeholder="请输入要翻译的文本..."
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-bg text-error-text select-none">
              {error}
            </div>
          )}

          {/* 结果显示区域 */}
          {result && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-secondary)] select-none">
                  翻译结果
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                  title="复制结果"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-primary)] bg-input min-h-[150px] whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>

        <Toast
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  )
}

export default TranslateTool


