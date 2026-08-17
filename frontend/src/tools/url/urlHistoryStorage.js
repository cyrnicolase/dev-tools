import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_URL_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadURLHistory() {
  return loadToolHistory('URL')
}

export function addURLHistoryItem(item) {
  return addToolHistoryItem('URL', { ...item, toolId: 'url' })
}
