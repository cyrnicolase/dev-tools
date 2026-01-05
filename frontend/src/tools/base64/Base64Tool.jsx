import React, { useState, useEffect, useRef } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import { useAutoFocus } from '../../hooks/useAutoFocus'

function Base64Tool({ onShowHelp, isActive = true }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.Base64) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  // 当选中 Base64 工具时，自动聚焦到输入框
  useAutoFocus(textareaRef, isActive)

  const handleEncode = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Base64) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      let result
      if (urlSafe) {
        result = await wailsAPI.Base64.EncodeURLSafe(input)
      } else {
        result = await wailsAPI.Base64.Encode(input)
      }
      if (result) {
        setOutput(result)
      }
    } catch (err) {
      setError(err.message || '编码失败')
    }
  }

  const handleDecode = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Base64) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      let result
      if (urlSafe) {
        result = await wailsAPI.Base64.DecodeURLSafe(input)
      } else {
        result = await wailsAPI.Base64.Decode(input)
      }
      if (result) {
        setOutput(result)
      }
    } catch (err) {
      setError(err.message || '解码失败: ' + err.message)
    }
  }

  const handleValidate = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Base64) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const isValid = urlSafe
        ? await wailsAPI.Base64.ValidateURLSafe(input)
        : await wailsAPI.Base64.Validate(input)
      
      if (isValid) {
        setError('')
        alert('Base64 格式有效')
      } else {
        setError('Base64 格式无效')
      }
    } catch (err) {
      setError('验证失败')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  const handleClear = () => {
    setOutput('')
    setError('')
  }

  return (
    <div className="h-full flex flex-col">
      <ToolHeader
        title="Base64 工具"
        description="Base64 编码和解码"
        toolId="base64"
        onShowHelp={onShowHelp}
      />
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">

      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">输入</h3>
          <div className="flex items-center space-x-6">
            {/* 左侧：配置选项 */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--text-primary)] select-none">URL 安全</span>
              </label>
            </div>
            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2 border-l border-border-input pl-6">
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors text-sm select-none"
              >
                验证
              </button>
              <button
                onClick={handleEncode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm font-medium select-none"
              >
                编码
              </button>
              <button
                onClick={handleDecode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm font-medium select-none"
              >
                解码
              </button>
            </div>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-64 p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入文本或 Base64 字符串..."
          spellCheck="false"
        />
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-error-bg text-error-text select-none">
            {error}
          </div>
        )}
      </div>

      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">输出</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClear}
                disabled={!output}
                className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="清空"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="复制"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-64 p-4 border border-border-input rounded-lg font-mono text-sm bg-input-disabled text-[var(--text-input)] focus:outline-none"
          placeholder="输出结果将显示在这里..."
          spellCheck="false"
        />
      </div>
      <Toast
        message="已复制到剪贴板"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      </div>
    </div>
  )
}

export default Base64Tool

