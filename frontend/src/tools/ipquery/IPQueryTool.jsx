import React, { useState, useEffect, useRef } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import { useAutoFocus } from '../../hooks/useAutoFocus'

function IPQueryTool({ onShowHelp, isActive = true }) {
  // 查询模式：'single' | 'batch'
  const [queryMode, setQueryMode] = useState('single')
  
  // 单个查询相关状态
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  
  // 批量查询相关状态（仅在内存中保存）
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 通用状态
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const inputRef = useRef(null)
  const batchInputRef = useRef(null)

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

  // 当选中 IP 查询工具时，自动聚焦到输入框
  useAutoFocus(inputRef, isActive && queryMode === 'single')
  useAutoFocus(batchInputRef, isActive && queryMode === 'batch')

  // 获取Wails API实例
  const getWailsAPIInstance = () => {
    return api || getWailsAPI()
  }

  // 验证API是否可用
  const validateAPI = () => {
    const wailsAPI = getWailsAPIInstance()
    if (!wailsAPI?.IPQuery) {
      setError('后端 API 未加载，请稍候重试')
      return null
    }
    return wailsAPI
  }

  // 验证IP地址格式
  const isValidIP = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  // 解析批量IP输入
  const parseIPs = (text) => {
    const lines = text.split('\n')
    const ips = []
    const ipSet = new Set()
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && isValidIP(trimmed)) {
        if (!ipSet.has(trimmed)) {
          ipSet.add(trimmed)
          ips.push(trimmed)
        }
      }
    }
    
    return ips
  }

  // 单个查询
  const handleQuery = async () => {
    try {
      setError('')
      setResults([])
      setLoading(true)

      const trimmedInput = input.trim()
      if (!trimmedInput) {
        setError('请输入IP地址')
        return
      }

      const wailsAPI = validateAPI()
      if (!wailsAPI) {
        return
      }

      const resultJson = await wailsAPI.IPQuery.Query(trimmedInput)
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

  // 批量查询
  const handleBatchQuery = async () => {
    try {
      setError('')
      setBatchResults([])
      setCurrentPage(1)
      setLoading(true)

      if (!batchInput.trim()) {
        setError('请输入IP地址')
        return
      }

      const ips = parseIPs(batchInput)
      if (ips.length === 0) {
        setError('未找到有效的IP地址，请检查输入格式（每行一个IP）')
        return
      }

      const wailsAPI = validateAPI()
      if (!wailsAPI) {
        return
      }

      const resultJson = await wailsAPI.IPQuery.QueryBatch(ips)
      if (resultJson) {
        const parsedResults = JSON.parse(resultJson)
        setBatchResults(parsedResults)
      }
    } catch (err) {
      setError(err.message || '批量查询失败')
    } finally {
      setLoading(false)
    }
  }

  // 复制单个结果
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

  // 复制批量查询结果
  const handleCopyBatchResult = async (result) => {
    try {
      const location = result.status === 'success' 
        ? `${result.country || 'N/A'}${result.region ? ` / ${result.region}` : ''}${result.city ? ` / ${result.city}` : ''}`
        : result.error || '查询失败'
      const text = `${result.ip}\t${location}`
      await navigator.clipboard.writeText(text)
      setToastMessage('已复制到剪贴板')
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  // 分页计算
  const totalPages = Math.ceil(batchResults.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentPageResults = batchResults.slice(startIndex, endIndex)

  // 切换模式时重置状态（但不清理批量查询数据）
  const handleModeChange = (mode) => {
    setQueryMode(mode)
    setError('')
    // 只清理单个查询的结果，保留批量查询的数据
    if (mode === 'single') {
      setResults([])
    }
    // 批量查询的数据和结果保留，不清理
  }

  // 统计批量输入的IP数量
  const batchIPCount = batchInput.trim() ? parseIPs(batchInput).length : 0

  return (
    <div className="h-full flex flex-col">
      <div>
        <ToolHeader
          title="IP查询工具"
          description="查询IP地址所属地信息（支持IPv4和IPv6）"
          toolId="ipquery"
          onShowHelp={onShowHelp}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* 模式切换 */}
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)] select-none">查询模式：</span>
            <button
              onClick={() => handleModeChange('single')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                queryMode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
              }`}
            >
              单个查询
            </button>
            <button
              onClick={() => handleModeChange('batch')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                queryMode === 'batch'
                  ? 'bg-blue-500 text-white'
                  : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
              }`}
            >
              批量查询
            </button>
          </div>

          {/* 单个查询模式 */}
          {queryMode === 'single' && (
            <>
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
                ref={inputRef}
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
                spellCheck="false"
              />
            </>
          )}

          {/* 批量查询模式 */}
          {queryMode === 'batch' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">批量输入</h3>
                <div className="flex items-center space-x-2">
                  {batchIPCount > 0 && (
                    <span className="text-sm text-[var(--text-secondary)] select-none">
                      已识别 {batchIPCount} 个IP
                    </span>
                  )}
                  <button
                    onClick={handleBatchQuery}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '查询中...' : '批量查询'}
                  </button>
                </div>
              </div>
              <textarea
                ref={batchInputRef}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="w-full h-48 p-4 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="每行输入一个IP地址，例如：&#10;8.8.8.8&#10;1.1.1.1&#10;2001:4860:4860::8888"
                spellCheck="false"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2 select-none">
                每行输入一个IP地址，支持IPv4和IPv6，会自动过滤无效IP和重复IP
              </p>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-error-bg text-error-text select-none">
              {error}
            </div>
          )}
        </div>

        {/* 单个查询结果 */}
        {queryMode === 'single' && results.length > 0 && (
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

        {/* 批量查询结果 - 表格展示 */}
        {queryMode === 'batch' && batchResults.length > 0 && (
          <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">
                查询结果（共 {batchResults.length} 条）
              </h3>
            </div>
            
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border-input">
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">IP地址</th>
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">国家</th>
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">省份/州</th>
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">城市</th>
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">状态</th>
                    <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)] select-none">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageResults.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-border-input hover:bg-hover transition-colors"
                    >
                      <td className="p-3 font-mono text-sm text-[var(--text-input)] select-none">
                        {result.ip}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-primary)] select-none">
                        {result.country || '-'}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-primary)] select-none">
                        {result.region || '-'}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-primary)] select-none">
                        {result.city || '-'}
                      </td>
                      <td className="p-3 text-sm select-none">
                        {result.status === 'success' ? (
                          <span className="text-green-600 dark:text-green-400">成功</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400" title={result.error}>
                            失败
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleCopyBatchResult(result)}
                          className="p-1.5 bg-button-secondary text-button-secondary-text rounded hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                          title="复制"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-input">
                <div className="text-sm text-[var(--text-secondary)] select-none">
                  显示第 {startIndex + 1} - {Math.min(endIndex, batchResults.length)} 条，共 {batchResults.length} 条
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors text-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-[var(--text-primary)] select-none">
                    第 {currentPage} / {totalPages} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors text-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <Toast
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  )
}

export default IPQueryTool
