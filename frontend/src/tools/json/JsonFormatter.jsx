import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Tooltip from '../../components/Tooltip'

function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [api, setApi] = useState(null)
  const [maximizeMode, setMaximizeMode] = useState('none') // 'none', 'fullscreen', 'content'
  const [inputMaximizeMode, setInputMaximizeMode] = useState('none') // 'none', 'fullscreen', 'content'
  const [preserveEscape, setPreserveEscape] = useState(true) // 默认保留转义
  const [lastFormattedInput, setLastFormattedInput] = useState('') // 保存最后一次格式化的输入
  const [outputFormat, setOutputFormat] = useState('json') // 'json' 或 'yaml'
  const [isMinified, setIsMinified] = useState(false) // 当前输出是否是压缩格式

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.JSON) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  // 当 preserveEscape 变化时，如果有输出内容，自动重新格式化
  useEffect(() => {
    // 只在 preserveEscape 变化且已有格式化输入时重新格式化
    // 跳过首次渲染（当 lastFormattedInput 为空时）
    if (!lastFormattedInput || !api?.JSON) {
      return
    }
    
    const reFormat = async () => {
      try {
        const wailsAPI = api || getWailsAPI()
        if (!wailsAPI?.JSON?.FormatWithEscape) {
          console.warn('FormatWithEscape API 不可用')
          return
        }
        console.log('重新格式化，preserveEscape:', preserveEscape, 'input length:', lastFormattedInput.length)
        const result = await wailsAPI.JSON.FormatWithEscape(lastFormattedInput, preserveEscape)
        if (result) {
          console.log('重新格式化成功，结果长度:', result.length)
          setOutput(result)
        }
      } catch (err) {
        console.error('重新格式化失败:', err)
      }
    }
    reFormat()
  }, [preserveEscape])

  const handleFormat = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      // 使用 FormatWithEscape 方法，传入 preserveEscape 参数
      const result = await wailsAPI.JSON.FormatWithEscape(input, preserveEscape)
      if (result) {
        setInput(result) // 同时格式化输入框内容
        setOutput(result)
        setLastFormattedInput(result) // 保存格式化后的输入（用于重新格式化）
        setOutputFormat('json') // 重置为 JSON 格式
        setIsMinified(false) // 格式化后不是压缩格式
      }
    } catch (err) {
      setError(err.message || '格式化失败')
    }
  }

  const handleToggleMinify = async () => {
    try {
      setError('')
      if (!output) {
        setError('请先格式化 JSON')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      
      // 只在 JSON 格式下才能压缩/格式化
      if (outputFormat !== 'json') {
        setError('请先将 YAML 转换为 JSON')
        return
      }
      
      let result
      if (isMinified) {
        // 当前是压缩格式，转换为格式化
        result = await wailsAPI.JSON.FormatWithEscape(output, preserveEscape)
        if (result) {
          setOutput(result)
          setIsMinified(false)
        }
      } else {
        // 当前是格式化格式，转换为压缩
        result = await wailsAPI.JSON.Minify(output)
        if (result) {
          setOutput(result)
          setIsMinified(true)
        }
      }
    } catch (err) {
      setError(err.message || '转换失败')
    }
  }

  const handleToggleYAML = async () => {
    try {
      setError('')
      if (!output) {
        setError('请先格式化 JSON')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      
      let result
      if (outputFormat === 'json') {
        // 当前是 JSON，转换为 YAML
        result = await wailsAPI.JSON.ToYAML(output)
        if (result) {
          setOutput(result)
          setOutputFormat('yaml')
          setIsMinified(false) // YAML 格式不是压缩格式
        } else {
          setError('转换失败：返回结果为空')
        }
      } else {
        // 当前是 YAML，转换回 JSON
        if (!wailsAPI.JSON.FromYAML) {
          setError('YAML 转 JSON 功能不可用，请检查后端 API')
          return
        }
        result = await wailsAPI.JSON.FromYAML(output)
        if (result) {
          setOutput(result)
          setOutputFormat('json')
          setIsMinified(false) // YAML 转 JSON 后是格式化格式
        } else {
          setError('转换失败：返回结果为空')
        }
      }
    } catch (err) {
      console.error('转换错误详情:', err)
      // 尝试提取更详细的错误信息
      let errorMsg = '转换失败'
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMsg = err.message
        } else if (err.toString) {
          errorMsg = err.toString()
        }
      } else if (typeof err === 'string') {
        errorMsg = err
      }
      setError(errorMsg)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleMaximizeFullscreen = () => {
    setMaximizeMode('fullscreen')
  }

  const handleMaximizeContent = () => {
    setMaximizeMode('content')
  }

  const handleRestoreOutput = () => {
    setMaximizeMode('none')
  }

  const handleInputMaximizeFullscreen = () => {
    setInputMaximizeMode('fullscreen')
  }

  const handleInputMaximizeContent = () => {
    setInputMaximizeMode('content')
  }

  const handleRestoreInput = () => {
    setInputMaximizeMode('none')
  }

  const isMaximized = maximizeMode !== 'none'
  const isFullscreen = maximizeMode === 'fullscreen'
  const isContentMaximized = maximizeMode === 'content'
  const isInputMaximized = inputMaximizeMode !== 'none'
  const isInputFullscreen = inputMaximizeMode === 'fullscreen'
  const isInputContentMaximized = inputMaximizeMode === 'content'

  return (
    <div className={`space-y-4 ${
      isFullscreen || isInputFullscreen
        ? 'fixed inset-0 z-50 bg-white p-8 overflow-auto' 
        : isContentMaximized || isInputContentMaximized
        ? 'fixed right-0 top-0 bottom-0 left-64 z-40 bg-white p-8 overflow-auto' 
        : ''
    }`}>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
        isInputMaximized ? 'h-full flex flex-col' : ''
      } ${isMaximized && !isInputMaximized ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">输入</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              格式化
            </button>
            {isInputMaximized ? (
              <Tooltip content="恢复" delay={200}>
                <button
                  onClick={handleRestoreInput}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </button>
              </Tooltip>
            ) : (
              <>
                <Tooltip content="内容区最大化" delay={200}>
                  <button
                    onClick={handleInputMaximizeContent}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip content="全屏最大化" delay={200}>
                  <button
                    onClick={handleInputMaximizeFullscreen}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4-4m0 0l4 4m-4-4v12M21 8l-4-4m0 0l-4 4m4-4v12M3 16l4 4m0 0l4-4m-4 4V4m14 12l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isInputMaximized ? 'flex-1 min-h-0' : 'h-64'
          }`}
          placeholder="输入 JSON 数据..."
        />
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${isMaximized ? 'h-full flex flex-col' : ''} ${isInputMaximized && !isMaximized ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">输出</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveEscape}
                onChange={(e) => setPreserveEscape(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">保留转义</span>
            </label>
          </div>
          <div className="flex space-x-2">
            <Tooltip content={output ? (isMinified ? "格式化 JSON" : "压缩 JSON") : "请先格式化 JSON"} delay={200}>
              <button
                onClick={handleToggleMinify}
                disabled={!output || outputFormat !== 'json'}
                className={`p-2 rounded-lg transition-colors ${
                  output && outputFormat === 'json'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content={output ? (outputFormat === 'json' ? "转换为 YAML" : "转换回 JSON") : "请先格式化 JSON"} delay={200}>
              <button
                onClick={handleToggleYAML}
                disabled={!output}
                className={`p-2 rounded-lg transition-colors ${
                  output
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </Tooltip>
            {isMaximized ? (
              <Tooltip content="恢复" delay={200}>
                <button
                  onClick={handleRestoreOutput}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </button>
              </Tooltip>
            ) : (
              <>
                <Tooltip content="内容区最大化" delay={200}>
                  <button
                    onClick={handleMaximizeContent}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip content="全屏最大化" delay={200}>
                  <button
                    onClick={handleMaximizeFullscreen}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4-4m0 0l4 4m-4-4v12M21 8l-4-4m0 0l-4 4m4-4v12M3 16l4 4m0 0l4-4m-4 4V4m14 12l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content="复制" delay={200}>
              <button
                onClick={handleCopy}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
        {output ? (
          <div className={`w-full border border-gray-300 rounded-lg overflow-hidden bg-gray-50 ${
            isMaximized ? 'flex-1 min-h-0' : 'h-64'
          }`}>
            <SyntaxHighlighter
              language={outputFormat === 'json' ? 'json' : 'yaml'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                height: '100%',
                fontSize: '0.875rem',
                overflow: 'auto',
                background: '#1e1e1e',
              }}
              showLineNumbers={false}
              wrapLines={true}
            >
              {output}
            </SyntaxHighlighter>
          </div>
        ) : (
          <textarea
            value={output}
            readOnly
            className={`w-full p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none ${
              isMaximized ? 'flex-1 min-h-0' : 'h-64'
            }`}
            placeholder="输出结果将显示在这里..."
          />
        )}
      </div>
    </div>
  )
}

export default JsonFormatter

