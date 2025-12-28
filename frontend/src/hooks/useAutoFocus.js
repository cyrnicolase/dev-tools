import { useEffect } from 'react'

/**
 * 自动聚焦 Hook
 * 当工具激活时，自动聚焦到指定的输入元素
 * 
 * @param {Object} ref - React ref 对象，指向要聚焦的元素
 * @param {boolean} isActive - 工具是否激活
 * @param {Array|boolean} condition - 额外的聚焦条件（可选）
 *   - 如果传入数组，数组中的值必须都为真值才会聚焦
 *   - 如果传入布尔值，该值为 true 时才会聚焦
 *   - 如果未传入，则只要 isActive 为 true 就会聚焦
 * @param {Object} options - 配置选项
 * @param {number} options.maxAttempts - 最大尝试次数，默认 10
 * @param {number} options.retryDelay - 重试延迟（毫秒），默认 50
 * @param {number} options.initialDelay - 初始延迟（毫秒），默认 100
 */
export function useAutoFocus(ref, isActive, condition = true, options = {}) {
  const {
    maxAttempts = 10,
    retryDelay = 50,
    initialDelay = 100,
  } = options

  useEffect(() => {
    if (!isActive) {
      return
    }

    // 检查聚焦条件
    let shouldFocus = true
    if (Array.isArray(condition)) {
      // 如果 condition 是数组，所有值必须都为真值
      shouldFocus = condition.length === 0 || condition.every(c => c)
    } else if (typeof condition === 'boolean') {
      // 如果 condition 是布尔值，直接使用
      shouldFocus = condition
    }

    if (!shouldFocus) {
      return
    }

    // 使用多重延迟确保元素已完全可见并渲染
    const focusInput = () => {
      if (ref?.current) {
        // 检查元素是否可见（不在 hidden 状态）
        const rect = ref.current.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0

        if (isVisible) {
          try {
            ref.current.focus()
            return true
          } catch (err) {
            return false
          }
        }
        return false
      }
      return false
    }

    // 尝试多次聚焦，直到成功
    let attempts = 0
    const tryFocus = () => {
      attempts++
      if (focusInput() || attempts >= maxAttempts) {
        return
      }
      // 如果还没成功，继续尝试
      setTimeout(tryFocus, retryDelay)
    }

    // 先等待一帧，确保 DOM 更新
    requestAnimationFrame(() => {
      setTimeout(tryFocus, initialDelay)
    })
  }, [isActive, condition, maxAttempts, retryDelay, initialDelay, ref])
}

