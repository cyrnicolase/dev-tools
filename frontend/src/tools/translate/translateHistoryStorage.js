import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_TRANSLATE_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadTranslateHistory() {
  return loadToolHistory('Translate')
}

export function addTranslateHistoryItem(item) {
  return addToolHistoryItem('Translate', { ...item, toolId: 'translate' })
}
