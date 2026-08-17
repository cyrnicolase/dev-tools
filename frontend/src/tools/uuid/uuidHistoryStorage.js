import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_UUID_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadUUIDHistory() {
  return loadToolHistory('UUID')
}

export function addUUIDHistoryItem(item) {
  return addToolHistoryItem('UUID', { ...item, toolId: 'uuid' })
}
