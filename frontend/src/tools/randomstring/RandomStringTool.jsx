import React, { useState, useEffect, useRef } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import Select from '../../components/Select'
import { useAutoFocus } from '../../hooks/useAutoFocus'

// 预设长度选项
const PRESET_LENGTHS = [
  { value: '8', label: '8' },
  { value: '16', label: '16' },
  { value: '32', label: '32' },
  { value: '64', label: '64' },
  { value: '128', label: '128' },
]

function RandomStringTool({ onShowHelp, isActive = true }) {
  const [length, setLength] = useState('16')
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeSpecial, setIncludeSpecial] = useState(true)
  const [count, setCount] = useState('1')
  const [results, setResults] = useState([])
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const lengthInputRef = useRef(null)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.RandomString) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  // 当选中随机字符串工具时，自动聚焦到长度输入框
  useAutoFocus(lengthInputRef, isActive)

  const handleGenerate = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.RandomString) {
        setError('后端 API 未加载，请稍候重试')
        return
      }

      // 验证长度
      const lengthNum = parseInt(length)
      if (isNaN(lengthNum) || lengthNum < 1 || lengthNum > 100) {
        setError('字符串长度必须在1-100之间')
        return
      }

      // 验证至少选择一个字符类型
      if (!includeNumbers && !includeLowercase && !includeUppercase && !includeSpecial) {
        setError('至少需要选择一个字符类型')
        return
      }

      // 验证生成数量
      const countNum = parseInt(count)
      if (isNaN(countNum) || countNum < 1 || countNum > 100) {
        setError('生成数量必须在1-100之间')
        return
      }

      let generatedResults = []
      if (countNum === 1) {
        // 单个生成
        const result = await wailsAPI.RandomString.Generate(
          lengthNum,
          includeNumbers,
          includeLowercase,
          includeUppercase,
          includeSpecial
        )
        generatedResults = [result]
      } else {
        // 批量生成
        generatedResults = await wailsAPI.RandomString.GenerateBatch(
          lengthNum,
          includeNumbers,
          includeLowercase,
          includeUppercase,
          includeSpecial,
          countNum
        )
      }

      setResults(generatedResults)
    } catch (err) {
      setError(err.message || '生成失败')
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  const handleCopyAll = async () => {
    try {
      const allText = results.join('\n')
      await navigator.clipboard.writeText(allText)
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  const handleClear = () => {
    setResults([])
    setError('')
  }

  // 只允许输入数字的处理函数
  const handleNumberInput = (value, setter) => {
    // 允许空字符串（用于清空）
    if (value === '') {
      setter('')
      return
    }
    // 只允许数字
    if (/^\d+$/.test(value)) {
      setter(value)
    }
  }

  // 处理预设长度选择
  const handlePresetLengthChange = (value) => {
    if (value) {
      setLength(value)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div>
        <ToolHeader
          title="随机字符串工具"
          description="生成随机字符串"
          toolId="randomstring"
          onShowHelp={onShowHelp}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 select-none">生成配置</h3>
          <div className="space-y-4">
            {/* 长度选择 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">字符串长度</label>
              <div className="flex gap-2">
                <Select
                  value=""
                  onChange={handlePresetLengthChange}
                  options={[
                    { value: '', label: '常用长度' },
                    ...PRESET_LENGTHS,
                  ]}
                  className="w-32"
                />
                <input
                  ref={lengthInputRef}
                  type="text"
                  value={length}
                  onChange={(e) => handleNumberInput(e.target.value, setLength)}
                  placeholder="输入长度"
                  className="flex-1 p-3 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  spellCheck="false"
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 select-none">
                范围：1-100，默认：16。可以从下拉框选择常用长度，或直接输入自定义长度
              </p>
            </div>

            {/* 字符类型选择 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">字符类型</label>
              <div className="space-y-2">
                <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-border-input rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--text-primary)] select-none">数字 (0-9)</span>
                </label>
                <label className="inline-flex items-center space-x-2 cursor-pointer select-none ml-6">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-border-input rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--text-primary)] select-none">小写字母 (a-z)</span>
                </label>
                <label className="inline-flex items-center space-x-2 cursor-pointer select-none ml-6">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-border-input rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--text-primary)] select-none">大写字母 (A-Z)</span>
                </label>
                <label className="inline-flex items-center space-x-2 cursor-pointer select-none ml-6">
                  <input
                    type="checkbox"
                    checked={includeSpecial}
                    onChange={(e) => setIncludeSpecial(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-border-input rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--text-primary)] select-none">特殊字符 (!@#$%^&*...)</span>
                </label>
              </div>
            </div>

            {/* 生成数量 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">生成数量</label>
              <input
                type="text"
                value={count}
                onChange={(e) => handleNumberInput(e.target.value, setCount)}
                placeholder="输入数量"
                className="w-full p-3 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                spellCheck="false"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2 select-none">
                范围：1-100，默认：1
              </p>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
            >
              生成随机字符串
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-error-bg text-error-text text-sm select-none">
              {error}
            </div>
          )}
        </div>

        {/* 结果显示 */}
        {results.length > 0 && (
          <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">生成结果</h3>
              <div className="flex items-center space-x-2">
                {results.length > 1 && (
                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors text-sm select-none"
                  >
                    复制全部
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                  title="清空"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-input-disabled border border-border-input rounded-lg"
                >
                  <span className="font-mono text-sm flex-1 text-[var(--text-input)] break-all">{result}</span>
                  <button
                    onClick={() => handleCopy(result)}
                    className="ml-2 p-1.5 bg-button-secondary text-button-secondary-text rounded hover:bg-[var(--button-secondary-hover)] transition-colors select-none flex-shrink-0"
                    title="复制"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Toast
          message="已复制到剪贴板"
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  )
}

export default RandomStringTool

