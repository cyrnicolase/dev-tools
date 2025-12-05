/**
 * 翻译配置验证工具
 */

/**
 * 验证有道翻译配置
 * @param {Object} config - 配置对象
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateYoudaoConfig(config) {
  if (!config.appKey || !config.appSecret) {
    return {
      valid: false,
      error: '请填写 App Key 和 App Secret',
    }
  }

  if (config.appKey.trim() === '' || config.appSecret.trim() === '') {
    return {
      valid: false,
      error: 'App Key 和 App Secret 不能为空',
    }
  }

  return {
    valid: true,
    error: '',
  }
}

/**
 * 验证提供商配置
 * @param {string} provider - 提供商类型
 * @param {Object} config - 配置对象
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateProviderConfig(provider, config) {
  switch (provider) {
    case 'youdao':
      return validateYoudaoConfig(config)
    default:
      return {
        valid: true,
        error: '',
      }
  }
}

