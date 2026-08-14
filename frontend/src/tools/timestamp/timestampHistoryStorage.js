import { getWailsAPI } from '../../utils/api'

export const MAX_TIMESTAMP_HISTORY_ITEMS = 50

const VALID_HISTORY_TYPES = new Set(['timestamp_to_time', 'time_to_timestamp'])

function isObjectValue(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isValidHistoryRecord(record) {
  if (!record || typeof record !== 'object') {
    return false
  }
  if (!record.id || typeof record.id !== 'string') {
    return false
  }
  if (!VALID_HISTORY_TYPES.has(record.type)) {
    return false
  }
  if (typeof record.createdAt !== 'number' || !Number.isFinite(record.createdAt) || record.createdAt <= 0) {
    return false
  }
  if (typeof record.format !== 'string' || typeof record.timezone !== 'string') {
    return false
  }
  if (!isObjectValue(record.input) || !isObjectValue(record.output)) {
    return false
  }
  return true
}

function getTimestampAPI() {
  const wailsAPI = getWailsAPI()
  return wailsAPI?.Timestamp
}

export async function loadTimestampHistory() {
  try {
    const timestampAPI = getTimestampAPI()
    if (!timestampAPI?.ListTimestampHistory) {
      return []
    }

    const records = await timestampAPI.ListTimestampHistory()
    if (!Array.isArray(records)) {
      return []
    }

    return records.filter(isValidHistoryRecord).slice(0, MAX_TIMESTAMP_HISTORY_ITEMS)
  } catch (error) {
    console.error('加载时间戳历史失败:', error)
    return []
  }
}

export async function addTimestampHistoryItem(item) {
  const current = await loadTimestampHistory()
  if (!isValidHistoryRecord(item)) {
    return { success: false, items: current }
  }

  try {
    const timestampAPI = getTimestampAPI()
    if (!timestampAPI?.AddTimestampHistory) {
      return { success: false, items: current }
    }

    const next = await timestampAPI.AddTimestampHistory(item)
    if (!Array.isArray(next)) {
      return { success: false, items: current }
    }

    return {
      success: true,
      items: next.filter(isValidHistoryRecord).slice(0, MAX_TIMESTAMP_HISTORY_ITEMS),
    }
  } catch (error) {
    console.error('保存时间戳历史失败:', error)
    return { success: false, items: current }
  }
}

export async function clearTimestampHistory() {
  try {
    const timestampAPI = getTimestampAPI()
    if (!timestampAPI?.ClearTimestampHistory) {
      return false
    }

    await timestampAPI.ClearTimestampHistory()
    return true
  } catch (error) {
    console.error('清空时间戳历史失败:', error)
    return false
  }
}
