import React, { useState, useEffect, useRef } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import Select from '../../components/Select'
import { useAutoFocus } from '../../hooks/useAutoFocus'

function HashTool({ onShowHelp, isActive }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [algorithm, setAlgorithm] = useState('md5')
  const [inputMode, setInputMode] = useState('text') // 'text' or 'file'
  const [filePath, setFilePath] = useState('')
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [buttonDisabledFeedback, setButtonDisabledFeedback] = useState(false)
  const inputRef = useRef(null)

  const algorithms = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA1' },
    { value: 'sha256', label: 'SHA256' },
    { value: 'sha512', label: 'SHA512' },
  ]

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.Hash) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  // 当 isActive 变为 true 时，自动聚焦输入框（仅在文本模式下）
  useAutoFocus(inputRef, isActive, inputMode === 'text', { maxAttempts: 15 })

  const handleSelectFile = async () => {
    try {
      setError('')
      setLoading(true)
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Hash) {
        setError('后端 API 未加载，请稍候重试')
        setLoading(false)
        return
      }
      const path = await wailsAPI.Hash.OpenFileDialog()
      if (path && path.trim()) {
        setFilePath(path)
        setInputMode('file')
        setError('')
      } else {
        // 用户取消选择，不显示错误
        setError('')
      }
    } catch (err) {
      // 只有当不是用户取消时才显示错误
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('取消')) {
        setError(err.message || '选择文件失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    // 检查按钮是否应该被禁用
    const isDisabled = loading || (inputMode === 'text' && !input.trim()) || (inputMode === 'file' && !filePath)
    if (isDisabled) {
      // 给用户反馈
      setButtonDisabledFeedback(true)
      setTimeout(() => {
        setButtonDisabledFeedback(false)
      }, 300)
      return
    }

    try {
      setError('')
      setLoading(true)
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Hash) {
        setError('后端 API 未加载，请稍候重试')
        return
      }

      let result
      if (inputMode === 'text') {
        if (!input.trim()) {
          setError('请输入要计算散列值的文本')
          return
        }
        result = await wailsAPI.Hash.HashText(algorithm, input)
      } else {
        if (!filePath) {
          setError('请先选择文件')
          return
        }
        result = await wailsAPI.Hash.HashFile(algorithm, filePath)
      }

      if (result) {
        setOutput(result)
      }
    } catch (err) {
      setError(err.message || '计算失败')
    } finally {
      setLoading(false)
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

  const handleInputModeChange = (mode) => {
    setInputMode(mode)
    setOutput('')
    setError('')
    if (mode === 'text') {
      setFilePath('')
    } else {
      setInput('')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <ToolHeader
        title="散列值计算工具"
        description="计算文本和文件的散列值（MD5、SHA1、SHA256、SHA512）"
        toolId="hash"
        onShowHelp={onShowHelp}
      />
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">输入</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[var(--text-primary)] select-none">输入方式：</span>
                <button
                  onClick={() => handleInputModeChange('text')}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                    inputMode === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
                  }`}
                >
                  文本输入
                </button>
                <button
                  onClick={() => handleInputModeChange('file')}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                    inputMode === 'file'
                      ? 'bg-blue-500 text-white'
                      : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
                  }`}
                >
                  文件选择
                </button>
              </div>
              <div className="flex items-center space-x-2 border-l border-border-input pl-4">
                <span className="text-sm font-medium text-[var(--text-primary)] select-none">算法：</span>
                <Select
                  value={algorithm}
                  onChange={setAlgorithm}
                  options={algorithms}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          {inputMode === 'text' ? (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-64 p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入要计算散列值的文本..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectFile}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {loading ? '选择中...' : '浏览文件'}
                </button>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => {
                    setFilePath(e.target.value)
                    setError('')
                  }}
                  className="flex-1 px-3 py-2 border border-border-input rounded-lg text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="输入文件路径或点击浏览文件按钮选择文件..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-error-bg text-error-text select-none">
              {error}
            </div>
          )}
        </div>

        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">输出</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCalculate}
                disabled={loading || (inputMode === 'text' && !input.trim()) || (inputMode === 'file' && !filePath)}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium select-none transition-all ${
                  loading || (inputMode === 'text' && !input.trim()) || (inputMode === 'file' && !filePath)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-600 active:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } ${
                  buttonDisabledFeedback ? 'animate-pulse' : ''
                }`}
              >
                {loading ? '计算中...' : '计算'}
              </button>
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
            placeholder="散列值结果将显示在这里..."
            autoComplete="off"
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

export default HashTool

