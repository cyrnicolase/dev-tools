import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'

function TimestampTool() {
  const [timestamp, setTimestamp] = useState('')
  const [timeString, setTimeString] = useState('')
  const [format, setFormat] = useState('RFC3339')
  const [timestampType, setTimestampType] = useState('second') // 'second' or 'milli'
  const [currentTime, setCurrentTime] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [currentTimestampMilli, setCurrentTimestampMilli] = useState(0)
  const [resultTimestamp, setResultTimestamp] = useState('')
  const [resultTimeString, setResultTimeString] = useState('')
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.Timestamp) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const formats = [
    { value: 'RFC3339', label: 'RFC3339' },
    { value: 'DateTime', label: 'YYYY-MM-DD HH:mm:ss' },
    { value: 'Date', label: 'YYYY-MM-DD' },
    { value: 'Time', label: 'HH:mm:ss' },
  ]

  useEffect(() => {
    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 1000)
    return () => clearInterval(interval)
  }, [format])

  const updateCurrentTime = async () => {
    try {
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        return
      }
      const time = await wailsAPI.Timestamp.FormatNow(format)
      const ts = await wailsAPI.Timestamp.GetCurrentTimestamp()
      const tsMilli = await wailsAPI.Timestamp.GetCurrentTimestampMilli()
      if (time) setCurrentTime(time)
      if (ts) setCurrentTimestamp(ts)
      if (tsMilli) setCurrentTimestampMilli(tsMilli)
    } catch (err) {
      console.error('Failed to update current time:', err)
    }
  }

  const handleTimestampToTime = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const ts = parseInt(timestamp, 10)
      if (isNaN(ts)) {
        setError('无效的时间戳')
        return
      }
      const result = timestampType === 'milli'
        ? await wailsAPI.Timestamp.TimestampToTimeStringMilli(ts, format)
        : await wailsAPI.Timestamp.TimestampToTimeString(ts, format)
      if (result) {
        setResultTimeString(result)
      }
    } catch (err) {
      setError(err.message || '转换失败')
    }
  }

  const handleTimeToTimestamp = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = timestampType === 'milli'
        ? await wailsAPI.Timestamp.TimeStringToTimestampMilli(timeString, format)
        : await wailsAPI.Timestamp.TimeStringToTimestamp(timeString, format)
      if (result) {
        setResultTimestamp(result.toString())
      }
    } catch (err) {
      setError(err.message || '转换失败')
    }
  }

  const handleGetCurrentTimestamp = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = timestampType === 'milli'
        ? await wailsAPI.Timestamp.GetCurrentTimestampMilli()
        : await wailsAPI.Timestamp.GetCurrentTimestamp()
      if (result) {
        setTimestamp(result.toString())
      }
    } catch (err) {
      setError(err.message || '获取失败')
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

  const handleGetCurrentTime = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = await wailsAPI.Timestamp.FormatNow(format)
      if (result) {
        setTimeString(result)
      }
    } catch (err) {
      setError(err.message || '获取失败')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">时间戳工具</h2>
        <p className="text-gray-600 text-sm select-none">时间戳和时间格式转换</p>
      </div>

      {/* 当前时间 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">当前时间</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 select-none">时间</label>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
              {currentTime || '加载中...'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 select-none">秒级时间戳</label>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
              {currentTimestamp || '加载中...'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 select-none">毫秒时间戳</label>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
              {currentTimestampMilli || '加载中...'}
            </div>
          </div>
        </div>
      </div>

      {/* 转换工具 - 水平布局 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 时间戳转时间 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">时间戳 → 时间</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">时间戳类型</label>
                <select
                  value={timestampType}
                  onChange={(e) => setTimestampType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  <option value="second">秒级时间戳</option>
                  <option value="milli">毫秒时间戳</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 select-none">时间戳</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="flex-1 p-3 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`输入${timestampType === 'milli' ? '毫秒' : '秒级'}时间戳...`}
                />
                <button
                  onClick={handleGetCurrentTimestamp}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
                >
                  当前
                </button>
              </div>
            </div>
            <button
              onClick={handleTimestampToTime}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
            >
              转换
            </button>
            {resultTimeString && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 select-none">结果</label>
                  <button
                    onClick={() => handleCopy(resultTimeString)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
                    title="复制"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm break-all">
                  {resultTimeString}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 时间转时间戳 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">时间 → 时间戳</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">时间戳类型</label>
                <select
                  value={timestampType}
                  onChange={(e) => setTimestampType(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  <option value="second">秒级时间戳</option>
                  <option value="milli">毫秒时间戳</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 select-none">格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 select-none">时间字符串</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  className="flex-1 p-3 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入时间字符串..."
                />
                <button
                  onClick={handleGetCurrentTime}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
                >
                  当前
                </button>
              </div>
            </div>
            <button
              onClick={handleTimeToTimestamp}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
            >
              转换
            </button>
            {resultTimestamp && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 select-none">结果</label>
                  <button
                    onClick={() => handleCopy(resultTimestamp)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
                    title="复制"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm break-all">
                  {resultTimestamp}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 select-none">
          {error}
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

export default TimestampTool

