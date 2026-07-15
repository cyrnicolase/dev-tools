const STORAGE_KEY = 'timestamp_history_v1'
export const MAX_TIMESTAMP_HISTORY_ITEMS = 50

const VALID_HISTORY_TYPES = new Set(['timestamp_to_time', 'time_to_timestamp'])

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
  if (typeof record.createdAt !== 'number') {
    return false
  }
  return true
}

export function loadTimestampHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidHistoryRecord)
  } catch (error) {
    console.error('加载时间戳历史失败:', error)
    return []
  }
}

export function saveTimestampHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (error) {
    console.error('保存时间戳历史失败:', error)
    return false
  }
}

export function addTimestampHistoryItem(item) {
  const current = loadTimestampHistory()
  if (!isValidHistoryRecord(item)) {
    return { success: false, items: current }
  }

  const next = [item, ...current].slice(0, MAX_TIMESTAMP_HISTORY_ITEMS)
  const success = saveTimestampHistory(next)
  return {
    success,
    items: success ? next : current,
  }
}

export function clearTimestampHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清空时间戳历史失败:', error)
    return false
  }
}
