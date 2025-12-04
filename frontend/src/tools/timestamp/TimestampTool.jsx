import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'

function TimestampTool({ onShowHelp }) {
  const [timestamp, setTimestamp] = useState('')
  const [timeString, setTimeString] = useState('')
  const [format, setFormat] = useState('RFC3339')
  const [timestampType, setTimestampType] = useState('second') // 'second' or 'milli'
  const [currentTimezone, setCurrentTimezone] = useState('Asia/Shanghai') // 当前时间区域时区，默认 UTC+8
  const [timestampToTimeTimezone, setTimestampToTimeTimezone] = useState('Asia/Shanghai') // 时间戳转时间工具时区，默认 UTC+8
  const [timeToTimestampTimezone, setTimeToTimestampTimezone] = useState('Asia/Shanghai') // 时间转时间戳工具时区，默认 UTC+8
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

  // 时区列表：按照 UTC+0, UTC+1, ..., UTC+12, UTC-1, UTC-2, ..., UTC-12 的顺序
  const timezones = [
    { value: 'UTC', label: '【零时区（UTC+0）】UTC', region: '零时区' },
    { value: 'Europe/Paris', label: '【东一区（UTC+1）】Europe/Paris', region: '东一区' },
    { value: 'Europe/Athens', label: '【东二区（UTC+2）】Europe/Athens', region: '东二区' },
    { value: 'Europe/Moscow', label: '【东三区（UTC+3）】Europe/Moscow', region: '东三区' },
    { value: 'Asia/Dubai', label: '【东四区（UTC+4）】Asia/Dubai', region: '东四区' },
    { value: 'Asia/Karachi', label: '【东五区（UTC+5）】Asia/Karachi', region: '东五区' },
    { value: 'Asia/Dhaka', label: '【东六区（UTC+6）】Asia/Dhaka', region: '东六区' },
    { value: 'Asia/Bangkok', label: '【东七区（UTC+7）】Asia/Bangkok', region: '东七区' },
    { value: 'Asia/Shanghai', label: '【东八区（UTC+8）】Asia/Shanghai', region: '东八区' },
    { value: 'Asia/Seoul', label: '【东九区（UTC+9）】Asia/Seoul', region: '东九区' },
    { value: 'Australia/Sydney', label: '【东十区（UTC+10）】Australia/Sydney', region: '东十区' },
    { value: 'Pacific/Auckland', label: '【东十一区（UTC+11）】Pacific/Auckland', region: '东十一区' },
    { value: 'Pacific/Fiji', label: '【东十二区（UTC+12）】Pacific/Fiji', region: '东十二区' },
    { value: 'Atlantic/Azores', label: '【西一区（UTC-1）】Atlantic/Azores', region: '西一区' },
    { value: 'Atlantic/South_Georgia', label: '【西二区（UTC-2）】Atlantic/South_Georgia', region: '西二区' },
    { value: 'America/Sao_Paulo', label: '【西三区（UTC-3）】America/Sao_Paulo', region: '西三区' },
    { value: 'America/Halifax', label: '【西四区（UTC-4）】America/Halifax', region: '西四区' },
    { value: 'America/New_York', label: '【西五区（UTC-5）】America/New_York', region: '西五区' },
    { value: 'America/Chicago', label: '【西六区（UTC-6）】America/Chicago', region: '西六区' },
    { value: 'America/Denver', label: '【西七区（UTC-7）】America/Denver', region: '西七区' },
    { value: 'America/Los_Angeles', label: '【西八区（UTC-8）】America/Los_Angeles', region: '西八区' },
    { value: 'America/Anchorage', label: '【西九区（UTC-9）】America/Anchorage', region: '西九区' },
    { value: 'Pacific/Honolulu', label: '【西十区（UTC-10）】Pacific/Honolulu', region: '西十区' },
    { value: 'Pacific/Midway', label: '【西十一区（UTC-11）】Pacific/Midway', region: '西十一区' },
    { value: 'Pacific/Baker_Island', label: '【西十二区（UTC-12）】Pacific/Baker_Island', region: '西十二区' },
  ]

  useEffect(() => {
    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 1000)
    return () => clearInterval(interval)
  }, [format, currentTimezone])

  const updateCurrentTime = async () => {
    try {
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        return
      }
      const time = await wailsAPI.Timestamp.FormatNow(format, currentTimezone)
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
        ? await wailsAPI.Timestamp.TimestampToTimeStringMilli(ts, format, timestampToTimeTimezone)
        : await wailsAPI.Timestamp.TimestampToTimeString(ts, format, timestampToTimeTimezone)
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
        ? await wailsAPI.Timestamp.TimeStringToTimestampMilli(timeString, format, timeToTimestampTimezone)
        : await wailsAPI.Timestamp.TimeStringToTimestamp(timeString, format, timeToTimestampTimezone)
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
      const result = await wailsAPI.Timestamp.FormatNow(format, timeToTimestampTimezone)
      if (result) {
        setTimeString(result)
      }
    } catch (err) {
      setError(err.message || '获取失败')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div>
        <ToolHeader
          title="时间戳工具"
          description="时间戳和时间格式转换"
          toolId="timestamp"
          onShowHelp={onShowHelp}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6">

      {/* 当前时间 */}
      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">当前时间</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-[var(--text-primary)] select-none">时区：</label>
            <select
              value={currentTimezone}
              onChange={(e) => setCurrentTimezone(e.target.value)}
              className="p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间</label>
            <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)]">
              {currentTime || '加载中...'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">秒级时间戳</label>
            <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)]">
              {currentTimestamp || '加载中...'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">毫秒时间戳</label>
            <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm text-[var(--text-input)]">
              {currentTimestampMilli || '加载中...'}
            </div>
          </div>
        </div>
      </div>

      {/* 转换工具 - 水平布局 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 时间戳转时间 */}
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 select-none">时间戳 → 时间</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间戳类型</label>
                <select
                  value={timestampType}
                  onChange={(e) => setTimestampType(e.target.value)}
                  className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  <option value="second">秒级时间戳</option>
                  <option value="milli">毫秒时间戳</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
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
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时区</label>
              <select
                value={timestampToTimeTimezone}
                onChange={(e) => setTimestampToTimeTimezone(e.target.value)}
                className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间戳</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="flex-1 p-3 text-sm border border-border-input rounded-lg font-mono text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`输入${timestampType === 'milli' ? '毫秒' : '秒级'}时间戳...`}
                />
                <button
                  onClick={handleGetCurrentTimestamp}
                  className="px-4 py-2 text-sm bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
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
                  <label className="block text-sm font-medium text-[var(--text-primary)] select-none">结果</label>
                  <button
                    onClick={() => handleCopy(resultTimeString)}
                    className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                    title="复制"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm break-all text-[var(--text-input)]">
                  {resultTimeString}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 时间转时间戳 */}
        <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 select-none">时间 → 时间戳</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间戳类型</label>
                <select
                  value={timestampType}
                  onChange={(e) => setTimestampType(e.target.value)}
                  className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                >
                  <option value="second">秒级时间戳</option>
                  <option value="milli">毫秒时间戳</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
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
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时区</label>
              <select
                value={timeToTimestampTimezone}
                onChange={(e) => setTimeToTimestampTimezone(e.target.value)}
                className="w-full p-2 text-sm border border-border-input rounded-lg text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%27)] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间字符串</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  className="flex-1 p-3 text-sm border border-border-input rounded-lg font-mono text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入时间字符串..."
                />
                <button
                  onClick={handleGetCurrentTime}
                  className="px-4 py-2 text-sm bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
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
                  <label className="block text-sm font-medium text-[var(--text-primary)] select-none">结果</label>
                  <button
                    onClick={() => handleCopy(resultTimestamp)}
                    className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                    title="复制"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm break-all text-[var(--text-input)]">
                  {resultTimestamp}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error-bg border border-red-200 rounded-lg p-4 text-error-text select-none">
          {error}
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

export default TimestampTool

