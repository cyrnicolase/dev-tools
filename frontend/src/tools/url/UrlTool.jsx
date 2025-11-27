import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'

function UrlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode') // encode, decode
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.URL) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const handleEncode = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.URL) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = await wailsAPI.URL.Encode(input)
      if (result !== undefined) {
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
      if (!wailsAPI?.URL) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = await wailsAPI.URL.Decode(input)
      if (result !== undefined) {
        setOutput(result)
      }
    } catch (err) {
      setError(err.message || '解码失败: ' + err.message)
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">URL 工具</h2>
        <p className="text-gray-600 text-sm select-none">URL 编码和解码</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 select-none">输入</h3>
          <div className="flex items-center space-x-6">
            {/* 左侧：模式选择 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 select-none">模式：</span>
              <button
                onClick={() => setMode('encode')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                  mode === 'encode'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                编码
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                  mode === 'decode'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                解码
              </button>
            </div>
            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2 border-l border-gray-300 pl-6">
              <button
                onClick={mode === 'encode' ? handleEncode : handleDecode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
              >
                {mode === 'encode' ? '编码' : '解码'}
              </button>
            </div>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 URL 编码字符串...'}
        />
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-red-50 text-red-700 select-none">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 select-none">输出</h3>
          <button
            onClick={handleCopy}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
            title="复制"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none"
          placeholder="输出结果将显示在这里..."
        />
      </div>
      <Toast
        message="已复制到剪贴板"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default UrlTool

