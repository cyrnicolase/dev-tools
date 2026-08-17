import { addToolHistoryItem, loadToolHistory, MAX_TOOL_HISTORY_ITEMS } from '../../utils/toolHistoryStorage'

export const MAX_QRCODE_HISTORY_ITEMS = MAX_TOOL_HISTORY_ITEMS

export function loadQRCodeHistory() {
  return loadToolHistory('QRCode')
}

export function addQRCodeHistoryItem(item) {
  return addToolHistoryItem('QRCode', { ...item, toolId: 'qrcode' })
}
