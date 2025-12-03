/**
 * JSON 搜索工具
 * 用于在 JSON 对象中搜索键和值
 */

/**
 * 检查文本是否匹配搜索条件
 * @param {string} text - 要检查的文本
 * @param {string} searchTerm - 搜索词
 * @param {boolean} caseSensitive - 是否区分大小写
 * @param {boolean} regex - 是否使用正则表达式
 * @returns {boolean} 是否匹配
 */
function matchesSearch(text, searchTerm, caseSensitive, regex) {
  if (!searchTerm) return false
  
  try {
    if (regex) {
      const flags = caseSensitive ? 'g' : 'gi'
      const regexPattern = new RegExp(searchTerm, flags)
      return regexPattern.test(text)
    } else {
      if (caseSensitive) {
        return text.includes(searchTerm)
      } else {
        return text.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }
  } catch (err) {
    // 正则表达式错误，回退到普通搜索
    if (caseSensitive) {
      return text.includes(searchTerm)
    } else {
      return text.toLowerCase().includes(searchTerm.toLowerCase())
    }
  }
}

/**
 * 在 JSON 对象中搜索键和值
 * @param {object} jsonObj - JSON 对象
 * @param {string} searchTerm - 搜索词
 * @param {boolean} caseSensitive - 是否区分大小写
 * @param {boolean} regex - 是否使用正则表达式
 * @returns {Array} 匹配结果数组，每个元素包含 { path, type, value, key }
 */
export function searchJsonKeys(jsonObj, searchTerm, caseSensitive = false, regex = false) {
  const matches = []
  
  if (!jsonObj || typeof jsonObj !== 'object') {
    return matches
  }
  
  /**
   * 递归遍历 JSON 对象
   * @param {any} obj - 当前对象
   * @param {string} path - 当前路径
   */
  function traverse(obj, path = '') {
    if (obj === null || obj === undefined) {
      return
    }
    
    if (Array.isArray(obj)) {
      // 处理数组
      obj.forEach((item, index) => {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`
        if (typeof item === 'object' && item !== null) {
          traverse(item, currentPath)
        } else {
          const valueStr = String(item)
          if (matchesSearch(valueStr, searchTerm, caseSensitive, regex)) {
            matches.push({
              path: currentPath,
              type: 'value',
              value: item,
              key: null,
            })
          }
        }
      })
    } else if (typeof obj === 'object') {
      // 处理对象
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        
        // 搜索键
        if (matchesSearch(key, searchTerm, caseSensitive, regex)) {
          matches.push({
            path: currentPath,
            type: 'key',
            value: value,
            key: key,
          })
        }
        
        // 搜索值
        if (value !== null && value !== undefined) {
          if (typeof value === 'string') {
            if (matchesSearch(value, searchTerm, caseSensitive, regex)) {
              matches.push({
                path: currentPath,
                type: 'value',
                value: value,
                key: key,
              })
            }
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            const valueStr = String(value)
            if (matchesSearch(valueStr, searchTerm, caseSensitive, regex)) {
              matches.push({
                path: currentPath,
                type: 'value',
                value: value,
                key: key,
              })
            }
          } else if (typeof value === 'object') {
            // 递归搜索嵌套对象
            traverse(value, currentPath)
          }
        }
      }
    }
  }
  
  traverse(jsonObj)
  return matches
}

/**
 * 在文本中查找 JSON 键值匹配的位置
 * @param {string} text - JSON 文本
 * @param {Array} matches - 搜索匹配结果
 * @returns {Array} 位置信息数组，每个元素包含 { line, column, length, path, type }
 */
export function findJsonMatchPositions(text, matches) {
  const positions = []
  const lines = text.split('\n')
  
  matches.forEach((match) => {
    const { path, type, key } = match
    
    // 尝试在文本中找到匹配的位置
    // 对于键，搜索 "key":
    // 对于值，搜索对应的值部分
    if (type === 'key' && key) {
      // 搜索键的位置
      const keyPattern = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`, 'g')
      let lineIndex = 0
      for (const line of lines) {
        const matchResult = keyPattern.exec(line)
        if (matchResult) {
          positions.push({
            line: lineIndex + 1,
            column: matchResult.index + 1,
            length: key.length + 2, // 包括引号
            path: path,
            type: type,
          })
          break
        }
        lineIndex++
      }
    } else if (type === 'value') {
      // 搜索值的位置
      const valueStr = String(match.value)
      const escapedValue = valueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const valuePattern = new RegExp(`:\\s*"${escapedValue}"`, 'g')
      let lineIndex = 0
      for (const line of lines) {
        const matchResult = valuePattern.exec(line)
        if (matchResult) {
          positions.push({
            line: lineIndex + 1,
            column: matchResult.index + matchResult[0].indexOf('"') + 1,
            length: valueStr.length + 2, // 包括引号
            path: path,
            type: type,
          })
          break
        }
        lineIndex++
      }
    }
  })
  
  return positions
}

