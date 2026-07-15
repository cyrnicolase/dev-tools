import React, { useState, useEffect, useRef } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import {
  addTimestampHistoryItem,
  clearTimestampHistory,
  loadTimestampHistory,
  MAX_TIMESTAMP_HISTORY_ITEMS,
} from './timestampHistoryStorage'
import Toast from '../../components/Toast'
import ToolHeader from '../../components/ToolHeader'
import Select from '../../components/Select'

function TimestampTool({ onShowHelp }) {
  const [timestamp, setTimestamp] = useState('')
  const [timeString, setTimeString] = useState('')
  const [format, setFormat] = useState('DateTime')
  const [timestampType, setTimestampType] = useState('second') // 'second' or 'milli'
  const [currentTimezone, setCurrentTimezone] = useState('Asia/Shanghai') // 当前时间区域时区，默认 UTC+8
  const [timestampToTimeTimezone, setTimestampToTimeTimezone] = useState('Asia/Shanghai') // 时间戳转时间工具时区，默认 UTC+8
  const [timeToTimestampTimezone, setTimeToTimestampTimezone] = useState('Asia/Shanghai') // 时间转时间戳工具时区，默认 UTC+8
  const [currentTime, setCurrentTime] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [currentTimestampMilli, setCurrentTimestampMilli] = useState(0)
  const [resultTimestampSecond, setResultTimestampSecond] = useState('')
  const [resultTimestampMilli, setResultTimestampMilli] = useState('')
  const [resultTimeString, setResultTimeString] = useState('')
  const [api, setApi] = useState(null)
  const [historyRecords, setHistoryRecords] = useState([])
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const historyPanelRef = useRef(null)
  const historyToggleButtonRef = useRef(null)

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

  useEffect(() => {
    setHistoryRecords(loadTimestampHistory())
  }, [])

  useEffect(() => {
    if (!isHistoryPanelOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      const panelNode = historyPanelRef.current
      const toggleButtonNode = historyToggleButtonRef.current
      const target = event.target
      if (panelNode?.contains(target) || toggleButtonNode?.contains(target)) {
        return
      }
      setIsHistoryPanelOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isHistoryPanelOpen])

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

  const createHistoryId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const handleClearHistory = () => {
    if (!clearTimestampHistory()) {
      setError('一键重置失败，请稍后重试')
      return
    }
    setHistoryRecords([])
    setTimestamp('')
    setTimeString('')
    setResultTimeString('')
    setResultTimestampSecond('')
    setResultTimestampMilli('')
    setFormat('DateTime')
    setTimestampType('second')
    setTimestampToTimeTimezone('Asia/Shanghai')
    setTimeToTimestampTimezone('Asia/Shanghai')
    setError('')
  }

  const handleApplyHistory = (record) => {
    if (record.type !== 'timestamp_to_time' && record.type !== 'time_to_timestamp') {
      return
    }

    setError('')
    setFormat(record.format || 'DateTime')
    if (record.type === 'timestamp_to_time') {
      setTimestamp(record.input?.timestamp || '')
      setTimestampToTimeTimezone(record.timezone || 'Asia/Shanghai')
      setResultTimeString(record.output?.timeString || '')
      setTimeString('')
      setResultTimestampSecond('')
      setResultTimestampMilli('')
      return
    }

    setTimeString(record.input?.timeString || '')
    setTimeToTimestampTimezone(record.timezone || 'Asia/Shanghai')
    setResultTimestampSecond(record.output?.second || '')
    setResultTimestampMilli(record.output?.milli || '')
    setTimestamp('')
    setResultTimeString('')
  }

  const handleCopyHistoryOutput = async (record) => {
    let outputText = ''
    if (record.type === 'timestamp_to_time') {
      outputText = record.output?.timeString || ''
    } else if (record.type === 'time_to_timestamp') {
      const second = record.output?.second || '—'
      const milli = record.output?.milli || '—'
      outputText = `秒级：${second}\n毫秒级：${milli}`
    }

    if (!outputText) {
      setError('暂无可复制内容')
      return
    }

    await handleCopy(outputText)
  }

  const handleTimestampToTime = async () => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const ts = parseInt(String(timestamp).trim(), 10)
      if (isNaN(ts)) {
        setError('无效的时间戳')
        return
      }
      if (ts < 0) {
        setError('时间戳格式错误，仅支持 10 位（秒）或 13 位（毫秒）')
        return
      }
      const isMilli = ts >= 1e12 && ts < 1e13
      const isSecond = ts < 1e10
      if (!isSecond && !isMilli) {
        setError('时间戳格式错误，仅支持 10 位（秒）或 13 位（毫秒）')
        return
      }
      const result = isMilli
        ? await wailsAPI.Timestamp.TimestampToTimeStringMilli(ts, format, timestampToTimeTimezone)
        : await wailsAPI.Timestamp.TimestampToTimeString(ts, format, timestampToTimeTimezone)
      if (result) {
        setResultTimeString(result)
        const { success, items } = addTimestampHistoryItem({
          id: createHistoryId(),
          type: 'timestamp_to_time',
          format,
          timezone: timestampToTimeTimezone,
          createdAt: Date.now(),
          input: {
            timestamp: String(timestamp).trim(),
            unit: isMilli ? 'milli' : 'second',
          },
          output: {
            timeString: result,
          },
        })
        if (success) {
          setHistoryRecords(items)
        } else {
          setError('历史记录保存失败，请稍后重试')
        }
      }
    } catch (err) {
      setError(err.message || '转换失败')
    }
  }

  const handleTimeToTimestamp = async () => {
    try {
      setError('')
      setResultTimestampSecond('')
      setResultTimestampMilli('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.Timestamp) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const tsSec = await wailsAPI.Timestamp.TimeStringToTimestamp(timeString, format, timeToTimestampTimezone)
      const tsMilli = await wailsAPI.Timestamp.TimeStringToTimestampMilli(timeString, format, timeToTimestampTimezone)
      setResultTimestampSecond(tsSec.toString())
      setResultTimestampMilli(tsMilli.toString())
      const { success, items } = addTimestampHistoryItem({
        id: createHistoryId(),
        type: 'time_to_timestamp',
        format,
        timezone: timeToTimestampTimezone,
        createdAt: Date.now(),
        input: {
          timeString,
        },
        output: {
          second: tsSec.toString(),
          milli: tsMilli.toString(),
        },
      })
      if (success) {
        setHistoryRecords(items)
      } else {
        setError('历史记录保存失败，请稍后重试')
      }
    } catch (err) {
      setError(err.message || '转换失败')
      setResultTimestampSecond('')
      setResultTimestampMilli('')
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
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="relative">
        <ToolHeader
          title="时间戳工具"
          description="时间戳和时间格式转换"
          toolId="timestamp"
          onShowHelp={onShowHelp}
        />
        <button
          ref={historyToggleButtonRef}
          onClick={() => setIsHistoryPanelOpen((prev) => !prev)}
          className={`absolute top-1 right-0 px-3 py-2 text-sm rounded-lg transition-colors select-none ${
            isHistoryPanelOpen
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)]'
          }`}
        >
          历史记录
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6">

      {/* 当前时间 */}
      <div className="bg-secondary rounded-lg shadow-sm border border-border-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] select-none">当前时间</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-[var(--text-primary)] select-none">时区：</label>
            <Select
              value={currentTimezone}
              onChange={setCurrentTimezone}
              options={timezones}
              className="w-64"
            />
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
              <div className="min-w-0">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">格式</label>
                <Select
                  value={format}
                  onChange={setFormat}
                  options={formats}
                  className="w-full h-[2.5rem]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时区</label>
                <Select
                  value={timestampToTimeTimezone}
                  onChange={setTimestampToTimeTimezone}
                  options={timezones}
                  className="w-full h-[2.5rem]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时间戳</label>
              <div className="flex space-x-2 items-center">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="flex-1 p-3 text-sm border border-border-input rounded-lg font-mono text-[var(--text-input)] bg-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入时间戳（自动识别秒/毫秒）"
                  spellCheck="false"
                />
                <Select
                  value={timestampType}
                  onChange={setTimestampType}
                  options={[
                    { value: 'second', label: '秒' },
                    { value: 'milli', label: '毫秒' },
                  ]}
                  className="w-20 shrink-0"
                />
                <button
                  onClick={handleGetCurrentTimestamp}
                  className="px-4 py-2 text-sm bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none shrink-0"
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
              <div className="min-w-0">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">格式</label>
                <Select
                  value={format}
                  onChange={setFormat}
                  options={formats}
                  className="w-full h-[2.5rem]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 select-none">时区</label>
                <Select
                  value={timeToTimestampTimezone}
                  onChange={setTimeToTimestampTimezone}
                  options={timezones}
                  className="w-full h-[2.5rem]"
                />
              </div>
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
                  spellCheck="false"
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
            {(resultTimestampSecond !== '' || resultTimestampMilli !== '') && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] select-none">秒级时间戳</label>
                    <button
                      onClick={() => handleCopy(resultTimestampSecond)}
                      className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                      title="复制"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm break-all text-[var(--text-input)]">
                    {resultTimestampSecond || '—'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] select-none">毫秒级时间戳</label>
                    <button
                      onClick={() => handleCopy(resultTimestampMilli)}
                      className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                      title="复制"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3 bg-input-disabled border border-border-input rounded-lg font-mono text-sm break-all text-[var(--text-input)]">
                    {resultTimestampMilli || '—'}
                  </div>
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
        duration={1000}
        className={isHistoryPanelOpen ? 'right-[440px]' : ''}
      />
      </div>

      <div
        ref={historyPanelRef}
        className={`absolute inset-y-0 right-0 z-20 w-[420px] max-w-full border-l border-border-primary bg-secondary shadow-xl transform transition-transform duration-200 ${
          isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
            <h3 className="text-base font-semibold text-[var(--text-primary)] select-none">
              转换历史（最近 {MAX_TIMESTAMP_HISTORY_ITEMS} 条）
            </h3>
            <button
              onClick={() => setIsHistoryPanelOpen(false)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-button-secondary text-button-secondary-text hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
              title="关闭历史面板"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 border-b border-border-primary">
            <button
              onClick={handleClearHistory}
              className="w-full px-3 py-2 text-sm bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
            >
              一键重置
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {historyRecords.length === 0 ? (
              <div className="p-3 bg-input-disabled border border-border-input rounded-lg text-sm text-[var(--text-secondary)] select-none">
                暂无历史记录，成功转换后会展示在这里
              </div>
            ) : (
              historyRecords.map((record) => {
                const isTsToTime = record.type === 'timestamp_to_time'
                const createdAt = new Date(record.createdAt || Date.now()).toLocaleString()
                return (
                  <div
                    key={record.id}
                    className="p-3 bg-secondary border border-border-primary rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] select-none">
                        {isTsToTime ? '时间戳 → 时间' : '时间 → 时间戳'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyHistoryOutput(record)}
                          className="px-2 py-1 text-xs bg-button-secondary text-button-secondary-text rounded hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                        >
                          复制输出
                        </button>
                        <span className="text-xs text-[var(--text-secondary)] select-none">{createdAt}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyHistory(record)}
                      className="w-full text-left rounded-md hover:bg-[var(--button-secondary-hover)] p-1 -m-1 transition-colors"
                      title="点击回填到转换区域"
                    >
                      <div className="text-xs text-[var(--text-secondary)] select-none mb-1">
                        格式：{record.format} ｜ 时区：{record.timezone}
                      </div>
                      {isTsToTime ? (
                        <div className="font-mono text-xs text-[var(--text-primary)] break-all">
                          输入：{record.input?.timestamp || '—'}（{record.input?.unit === 'milli' ? '毫秒' : '秒'}）<br />
                          输出：{record.output?.timeString || '—'}
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-[var(--text-primary)] break-all">
                          输入：{record.input?.timeString || '—'}<br />
                          输出：秒级 {record.output?.second || '—'} ｜ 毫秒级 {record.output?.milli || '—'}
                        </div>
                      )}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimestampTool

