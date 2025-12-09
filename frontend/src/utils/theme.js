/**
 * 主题管理工具
 */

const DEFAULT_THEME = 'dark'
const VALID_THEMES = ['light', 'dark']

/**
 * 验证主题名称
 * @param {string} theme - 主题名称
 * @returns {string} 有效的主题名称
 */
function validateTheme(theme) {
  return VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME
}

/**
 * 加载并应用主题
 * @param {string} theme - 主题名称 ('light' | 'dark')
 */
export function loadTheme(theme) {
  const validTheme = validateTheme(theme)
  if (theme !== validTheme) {
    console.warn(`无效的主题: ${theme}，使用默认主题 ${validTheme}`)
  }
  
  // 设置 data-theme 属性到 html 元素
  document.documentElement.setAttribute('data-theme', validTheme)
}

/**
 * 获取默认主题
 * @returns {string} 默认主题名称
 */
export function getDefaultTheme() {
  return DEFAULT_THEME
}

