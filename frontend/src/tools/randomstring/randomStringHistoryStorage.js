import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_RANDOMSTRING_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadRandomStringHistory() {
  return loadToolHistory('RandomString')
}

export function addRandomStringHistoryItem(item) {
  return addToolHistoryItem('RandomString', { ...item, toolId: 'randomstring' })
}
