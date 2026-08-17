import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_HASH_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadHashHistory() {
  return loadToolHistory('Hash')
}

export function addHashHistoryItem(item) {
  return addToolHistoryItem('Hash', { ...item, toolId: 'hash' })
}
