import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_IPQUERY_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadIPQueryHistory() {
  return loadToolHistory('IPQuery')
}

export function addIPQueryHistoryItem(item) {
  return addToolHistoryItem('IPQuery', { ...item, toolId: 'ipquery' })
}
