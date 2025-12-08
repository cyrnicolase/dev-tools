/**
 * 工具相关的工具函数
 */

import { VIEW_IDS } from '../constants/tools'

/**
 * 规范化工具ID（转换为小写并去除空格）
 * @param {string} toolID - 工具ID
 * @returns {string} 规范化后的工具ID
 */
export function normalizeToolID(toolID) {
  if (!toolID || typeof toolID !== 'string') {
    return ''
  }
  return toolID.toLowerCase().trim()
}

/**
 * 验证工具ID是否有效
 * @param {string} toolID - 工具ID
 * @returns {boolean} 是否有效
 */
export function isValidToolID(toolID) {
  const normalized = normalizeToolID(toolID)
  return normalized !== '' && VIEW_IDS.includes(normalized)
}


