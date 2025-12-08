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

/**
 * 切换工具并同步后端状态
 * @param {string} toolID - 工具ID
 * @param {Function} setActiveTool - 设置活动工具的函数
 * @param {Function} syncBackendState - 同步后端状态的函数
 * @param {boolean} apiReady - API是否就绪
 */
export function switchTool(toolID, setActiveTool, syncBackendState, apiReady) {
  const normalized = normalizeToolID(toolID)
  if (!isValidToolID(normalized)) {
    return false
  }
  
  setActiveTool(normalized)
  
  if (apiReady && syncBackendState) {
    syncBackendState(normalized)
  }
  
  return true
}

