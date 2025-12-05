/**
 * 工具相关常量
 */

// 工具 ID 列表
export const TOOL_IDS = ['json', 'base64', 'timestamp', 'uuid', 'url', 'qrcode', 'ipquery', 'translate']

// 视图列表（包括工具和菜单视图）
export const VIEW_IDS = [...TOOL_IDS, 'help']

// 工具配置列表
export const TOOLS = [
  { id: 'json', name: 'JSON', icon: '📄' },
  { id: 'base64', name: 'Base64', icon: '🔐' },
  { id: 'timestamp', name: '时间戳', icon: '⏰' },
  { id: 'uuid', name: 'UUID', icon: '🆔' },
  { id: 'url', name: 'URL', icon: '🔗' },
  { id: 'qrcode', name: '二维码', icon: '📱' },
  { id: 'ipquery', name: 'IP查询', icon: '🌍' },
  { id: 'translate', name: '翻译', icon: '🌐' },
]

// 默认工具 ID
export const DEFAULT_TOOL_ID = 'json'

