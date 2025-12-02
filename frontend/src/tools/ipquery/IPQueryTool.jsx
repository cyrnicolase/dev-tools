import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'

function IPQueryTool({ onShowHelp }) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.IPQuery) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const handleQuery = async () => {
    try {
      setError('')
      setResults([])
      setLoading(true)

      if (!input.trim()) {
        setError('请输入IP地址')
        setLoading(false)
        return
      }

      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.IPQuery) {
        setError('后端 API 未加载，请稍候重试')
        setLoading(false)
        return
      }

      const resultJson = await wailsAPI.IPQuery.Query(input.trim())
      if (resultJson) {
        const parsedResults = JSON.parse(resultJson)
        setResults(parsedResults)
      }
    } catch (err) {
      setError(err.message || '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (result) => {
    try {
      const text = `数据源: ${result.source}\n国家: ${result.country || 'N/A'}\n省份/州: ${result.region || 'N/A'}\n城市: ${result.city || 'N/A'}`
      await navigator.clipboard.writeText(text)
      setToastMessage(`已复制 ${result.source} 的查询结果`)
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <ToolHeader
          title="IP查询工具"
          description="查询IP地址所属地信息（支持IPv4和IPv6）"
          toolId="ipquery"
          onShowHelp={onShowHelp}
        />
      </div>

      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">输入</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuery}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleQuery()
            }
          }}
          className="w-full p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入IP地址，例如: 8.8.8.8 或 2001:4860:4860::8888"
        />
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-error-bg text-error-text select-none">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`bg-secondary rounded-lg shadow-sm border p-6 ${
                result.status === 'error' ? 'border-red-200' : 'border-border-primary'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">
                  {result.source}
                </h3>
                {result.status === 'success' && (
                  <button
                    onClick={() => handleCopy(result)}
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
                )}
              </div>

              {result.status === 'error' ? (
                <div className="p-3 rounded-lg bg-error-bg text-error-text select-none">
                  {result.error || '查询失败'}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-[var(--text-secondary)] select-none">国家：</span>
                    <span className="text-sm font-medium text-[var(--text-primary)] ml-2 select-none">
                      {result.country || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--text-secondary)] select-none">省份/州：</span>
                    <span className="text-sm font-medium text-[var(--text-primary)] ml-2 select-none">
                      {result.region || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--text-secondary)] select-none">城市：</span>
                    <span className="text-sm font-medium text-[var(--text-primary)] ml-2 select-none">
                      {result.city || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
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

export default IPQueryTool

