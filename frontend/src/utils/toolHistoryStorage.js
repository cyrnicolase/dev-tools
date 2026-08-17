import { getWailsAPI } from './api'

export const MAX_TOOL_HISTORY_ITEMS = 50

function isObjectValue(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isValidRecord(record) {
  if (!record || typeof record !== 'object') {
    return false
  }
  if (!record.id || typeof record.id !== 'string') {
    return false
  }
  if (!record.toolId || typeof record.toolId !== 'string') {
    return false
  }
  if (!record.action || typeof record.action !== 'string') {
    return false
  }
  if (typeof record.createdAt !== 'number' || !Number.isFinite(record.createdAt) || record.createdAt <= 0) {
    return false
  }
  if (!isObjectValue(record.input) || !isObjectValue(record.output)) {
    return false
  }
  return true
}

function getToolAPI(toolAPIKey) {
  const wailsAPI = getWailsAPI()
  return wailsAPI?.[toolAPIKey]
}

export async function loadToolHistory(toolAPIKey) {
  try {
    const toolAPI = getToolAPI(toolAPIKey)
    if (!toolAPI?.ListHistory) {
      return []
    }
    const records = await toolAPI.ListHistory()
    if (!Array.isArray(records)) {
      return []
    }
    return records.filter(isValidRecord).slice(0, MAX_TOOL_HISTORY_ITEMS)
  } catch (error) {
    console.error('加载工具历史失败:', error)
    return []
  }
}

export async function addToolHistoryItem(toolAPIKey, item) {
  const current = await loadToolHistory(toolAPIKey)
  if (!isValidRecord(item)) {
    return { success: false, items: current }
  }

  try {
    const toolAPI = getToolAPI(toolAPIKey)
    if (!toolAPI?.AddHistory) {
      return { success: false, items: current }
    }
    const next = await toolAPI.AddHistory(item)
    if (!Array.isArray(next)) {
      return { success: false, items: current }
    }
    return {
      success: true,
      items: next.filter(isValidRecord).slice(0, MAX_TOOL_HISTORY_ITEMS),
    }
  } catch (error) {
    console.error('保存工具历史失败:', error)
    return { success: false, items: current }
  }
}

export function createHistoryId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function truncateText(text, maxLength = 160) {
  const normalized = String(text || '')
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, maxLength)}...`
}
