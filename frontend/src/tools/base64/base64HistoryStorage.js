import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_BASE64_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadBase64History() {
  return loadToolHistory('Base64')
}

export function addBase64HistoryItem(item) {
  return addToolHistoryItem('Base64', { ...item, toolId: 'base64' })
}
