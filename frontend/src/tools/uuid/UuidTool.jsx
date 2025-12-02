import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'

function UuidTool({ onShowHelp }) {
  const [version, setVersion] = useState('v4')
  const [count, setCount] = useState(1)
  const [namespace, setNamespace] = useState('')
  const [name, setName] = useState('')
  const [formatCase, setFormatCase] = useState('lowercase') // 'lowercase' | 'uppercase'
  const [formatHyphens, setFormatHyphens] = useState(true) // true = 带连字符, false = 无连字符
  const [results, setResults] = useState([])
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.UUID) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const handleGenerate = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.UUID) {
        setError('后端 API 未加载，请稍候重试')
        return
      }

      // 验证 v3/v5 需要 namespace 和 name
      if ((version === 'v3' || version === 'v5') && (!namespace || !name)) {
        setError('v3 和 v5 版本需要提供 namespace 和 name')
        return
      }

      // 验证 namespace 格式（如果提供）
      if (namespace && !isValidUUID(namespace)) {
        setError('namespace 必须是有效的 UUID 格式')
        return
      }

      let generatedResults = []
      if (count === 1) {
        // 单个生成
        let result
        switch (version) {
          case 'v1':
            result = await wailsAPI.UUID.GenerateV1()
            break
          case 'v3':
            result = await wailsAPI.UUID.GenerateV3(namespace, name)
            break
          case 'v4':
            result = await wailsAPI.UUID.GenerateV4()
            break
          case 'v5':
            result = await wailsAPI.UUID.GenerateV5(namespace, name)
            break
          default:
            setError('不支持的 UUID 版本')
            return
        }
        generatedResults = [result]
      } else {
        // 批量生成
        generatedResults = await wailsAPI.UUID.GenerateBatch(version, count, namespace || '', name || '')
      }

      // 应用格式化
      const formattedResults = generatedResults.map(uuid => formatUUID(uuid, formatCase, formatHyphens))
      setResults(formattedResults)
    } catch (err) {
      setError(err.message || '生成失败')
    }
  }

  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // 格式化 UUID
  const formatUUID = (uuid, caseFormat, includeHyphens) => {
    let formatted = uuid
    
    // 处理大小写
    if (caseFormat === 'uppercase') {
      formatted = formatted.toUpperCase()
    } else {
      formatted = formatted.toLowerCase()
    }
    
    // 处理连字符
    if (!includeHyphens) {
      formatted = formatted.replace(/-/g, '')
    }
    
    return formatted
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

  const predefinedNamespaces = [
    { label: 'DNS', value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
    { label: 'URL', value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8' },
    { label: 'ISO OID', value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8' },
    { label: 'X.500 DN', value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <ToolHeader
          title="UUID 工具"
          description="生成各种版本的 UUID"
          toolId="uuid"
          onShowHelp={onShowHelp}
        />
      </div>

      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 select-none">生成配置</h3>
        <div className="space-y-4">
          {/* UUID 版本选择 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">UUID 版本</label>
            <div className="flex flex-wrap gap-2">
              {['v1', 'v3', 'v4', 'v5'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                    version === v
                      ? 'bg-blue-500 text-white'
                      : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 select-none">
              {version === 'v1' && '基于时间戳和 MAC 地址'}
              {version === 'v3' && '基于命名空间和名称的 MD5（确定性：相同输入生成相同 UUID）'}
              {version === 'v4' && '随机生成（推荐）'}
              {version === 'v5' && '基于命名空间和名称的 SHA-1（确定性：相同输入生成相同 UUID）'}
            </p>
          </div>

          {/* 批量生成数量 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">生成数量</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="w-full p-3 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* 格式选项 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">格式选项</label>
            <div className="flex items-center gap-6">
              {/* 大小写选项 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] select-none">大小写：</span>
                <div className="flex gap-1">
                  {[
                    { value: 'lowercase', label: '小写' },
                    { value: 'uppercase', label: '大写' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormatCase(option.value)}
                      className={`px-3 py-1.5 rounded transition-colors text-sm select-none ${
                        formatCase === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 连字符选项 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] select-none">连字符：</span>
                <div className="flex gap-1">
                  {[
                    { value: true, label: '带' },
                    { value: false, label: '无' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => setFormatHyphens(option.value)}
                      className={`px-3 py-1.5 rounded transition-colors text-sm select-none ${
                        formatHyphens === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* v3/v5 的 namespace 和 name */}
          {(version === 'v3' || version === 'v5') && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">Namespace</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      className="flex-1 p-2 border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">选择预定义命名空间</option>
                      {predefinedNamespaces.map((ns) => (
                        <option key={ns.value} value={ns.value}>
                          {ns.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="或输入自定义 UUID"
                    className="w-full p-3 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入名称"
                  className="w-full p-3 border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
          >
            生成 UUID
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
            {results.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors text-sm select-none"
              >
                复制全部
              </button>
            )}
          </div>
          <div className="space-y-2">
            {results.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-input-disabled border border-border-input rounded-lg"
              >
                <span className="font-mono text-sm flex-1 text-[var(--text-input)]">{uuid}</span>
                <button
                  onClick={() => handleCopy(uuid)}
                  className="ml-2 p-1.5 bg-button-secondary text-button-secondary-text rounded hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
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
  )
}

export default UuidTool

