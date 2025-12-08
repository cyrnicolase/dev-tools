/**
 * 工具搜索相关的工具函数
 * 支持模糊匹配（连续字符和通配符模式）
 */

/**
 * 模糊匹配结果
 * @typedef {Object} MatchResult
 * @property {boolean} matched - 是否匹配
 * @property {number} score - 匹配度分数
 * @property {Array<number>} matchedIndices - 匹配字符的索引位置
 */

/**
 * 检查文本是否匹配模式（支持连续字符和通配符）
 * @param {string} pattern - 搜索模式（如 "base", "b*4", "b*s*4"）
 * @param {string} text - 要匹配的文本
 * @returns {MatchResult} 匹配结果
 */
export function fuzzyMatch(pattern, text) {
  if (!pattern || !text) {
    return { matched: false, score: 0, matchedIndices: [] }
  }

  const patternLower = pattern.toLowerCase()
  const textLower = text.toLowerCase()

  // 如果模式包含通配符（*），使用通配符匹配
  if (patternLower.includes('*')) {
    return wildcardMatch(patternLower, textLower)
  }

  // 否则使用连续字符匹配
  return consecutiveMatch(patternLower, textLower)
}

/**
 * 通配符匹配（如 "b*4" 匹配 "Base64"）
 * @param {string} pattern - 包含 * 的模式
 * @param {string} text - 要匹配的文本
 * @returns {MatchResult}
 */
function wildcardMatch(pattern, text) {
  const parts = pattern.split('*').filter(p => p.length > 0)
  if (parts.length === 0) {
    return { matched: true, score: 0, matchedIndices: [] }
  }

  let lastIndex = 0
  const matchedIndices = []
  let totalScore = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const index = text.indexOf(part, lastIndex)
    
    if (index === -1) {
      return { matched: false, score: 0, matchedIndices: [] }
    }

    // 记录匹配的字符索引
    for (let j = 0; j < part.length; j++) {
      matchedIndices.push(index + j)
    }

    // 计算分数：位置越靠前得分越高，连续匹配得分更高
    const positionScore = (text.length - index) / text.length * 100
    const consecutiveBonus = i === 0 || index === lastIndex ? 50 : 0
    totalScore += positionScore + consecutiveBonus

    lastIndex = index + part.length
  }

  return {
    matched: true,
    score: totalScore,
    matchedIndices: matchedIndices.sort((a, b) => a - b)
  }
}

/**
 * 连续字符匹配（如 "base" 匹配 "Base64"）
 * @param {string} pattern - 连续字符模式
 * @param {string} text - 要匹配的文本
 * @returns {MatchResult}
 */
function consecutiveMatch(pattern, text) {
  let patternIndex = 0
  let textIndex = 0
  const matchedIndices = []

  // 尝试找到连续匹配
  while (textIndex < text.length && patternIndex < pattern.length) {
    if (text[textIndex] === pattern[patternIndex]) {
      matchedIndices.push(textIndex)
      patternIndex++
    }
    textIndex++
  }

  // 如果所有字符都匹配了
  if (patternIndex === pattern.length) {
    // 计算分数：位置权重 + 连续度权重 + 匹配数量权重
    const firstMatchIndex = matchedIndices[0]
    const positionScore = (text.length - firstMatchIndex) / text.length * 100
    
    // 检查连续度（连续匹配的字符数）
    let consecutiveCount = 1
    for (let i = 1; i < matchedIndices.length; i++) {
      if (matchedIndices[i] === matchedIndices[i - 1] + 1) {
        consecutiveCount++
      }
    }
    const consecutiveScore = (consecutiveCount / pattern.length) * 100
    
    // 匹配数量权重
    const matchRatio = pattern.length / text.length
    const quantityScore = matchRatio * 50

    const totalScore = positionScore + consecutiveScore + quantityScore

    return {
      matched: true,
      score: totalScore,
      matchedIndices
    }
  }

  return { matched: false, score: 0, matchedIndices: [] }
}

/**
 * 计算匹配度分数（用于排序）
 * @param {string} pattern - 搜索模式
 * @param {string} text - 匹配的文本
 * @param {MatchResult} matchResult - 匹配结果
 * @returns {number} 最终分数
 */
export function calculateMatchScore(pattern, text, matchResult) {
  if (!matchResult.matched) {
    return 0
  }

  // 基础分数
  let score = matchResult.score

  // 完全匹配加分
  if (pattern.toLowerCase() === text.toLowerCase()) {
    score += 200
  }

  // 开头匹配加分
  if (text.toLowerCase().startsWith(pattern.toLowerCase())) {
    score += 100
  }

  return score
}

/**
 * 搜索工具列表
 * @param {string} query - 搜索关键词
 * @param {Array<{id: string, name: string, icon: string}>} tools - 工具列表
 * @returns {Array<{tool: Object, score: number, matchResult: MatchResult}>} 匹配的工具列表（按分数排序）
 */
export function searchTools(query, tools) {
  if (!query || query.trim() === '') {
    return []
  }

  const results = []

  for (const tool of tools) {
    // 同时搜索工具名称和ID
    const nameMatch = fuzzyMatch(query, tool.name)
    const idMatch = fuzzyMatch(query, tool.id)

    // 选择更好的匹配结果
    let bestMatch = nameMatch
    let searchText = tool.name

    if (idMatch.matched && (!nameMatch.matched || idMatch.score > nameMatch.score)) {
      bestMatch = idMatch
      searchText = tool.id
    }

    if (bestMatch.matched) {
      const score = calculateMatchScore(query, searchText, bestMatch)
      results.push({
        tool,
        score,
        matchResult: bestMatch
      })
    }
  }

  // 按分数降序排序
  results.sort((a, b) => b.score - a.score)

  return results
}

