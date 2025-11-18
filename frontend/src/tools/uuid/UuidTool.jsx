import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'

function UuidTool() {
  const [version, setVersion] = useState('v4')
  const [count, setCount] = useState(1)
  const [namespace, setNamespace] = useState('')
  const [name, setName] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [api, setApi] = useState(null)

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

      setResults(generatedResults)
    } catch (err) {
      setError(err.message || '生成失败')
    }
  }

  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleCopyAll = () => {
    const allText = results.join('\n')
    navigator.clipboard.writeText(allText)
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">UUID 工具</h2>
        <p className="text-gray-600 text-sm select-none">生成各种版本的 UUID</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">生成配置</h3>
        <div className="space-y-4">
          {/* UUID 版本选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 select-none">UUID 版本</label>
            <div className="flex flex-wrap gap-2">
              {['v1', 'v3', 'v4', 'v5'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                    version === v
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 select-none">
              {version === 'v1' && '基于时间戳和 MAC 地址'}
              {version === 'v3' && '基于命名空间和名称的 MD5（确定性：相同输入生成相同 UUID）'}
              {version === 'v4' && '随机生成（推荐）'}
              {version === 'v5' && '基于命名空间和名称的 SHA-1（确定性：相同输入生成相同 UUID）'}
            </p>
          </div>

          {/* 批量生成数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 select-none">生成数量</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* v3/v5 的 namespace 和 name */}
          {(version === 'v3' || version === 'v5') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">Namespace</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入名称"
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm select-none">
            {error}
          </div>
        )}
      </div>

      {/* 结果显示 */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 select-none">生成结果</h3>
            {results.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm select-none"
              >
                复制全部
              </button>
            )}
          </div>
          <div className="space-y-2">
            {results.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="font-mono text-sm flex-1">{uuid}</span>
                <button
                  onClick={() => handleCopy(uuid)}
                  className="ml-2 p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors select-none"
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
    </div>
  )
}

export default UuidTool

