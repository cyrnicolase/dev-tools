import React, { useState, useRef, useEffect } from 'react'

function Tooltip({ children, content, delay = 200 }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, centerX: 0 })
  const timeoutRef = useRef(null)
  const tooltipRef = useRef(null)
  const wrapperRef = useRef(null)

  const handleMouseEnter = (e) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect()
        // 先设置一个初始位置，然后在 useEffect 中调整
        setPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
          centerX: rect.left + rect.width / 2,
        })
        setShow(true)
      }
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShow(false)
  }

  useEffect(() => {
    if (show && tooltipRef.current && wrapperRef.current) {
      // 使用双重 requestAnimationFrame 确保 tooltip 已渲染并可以获取尺寸
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!tooltipRef.current || !wrapperRef.current) return
          
          const tooltip = tooltipRef.current
          const wrapperRect = wrapperRef.current.getBoundingClientRect()
          const tooltipRect = tooltip.getBoundingClientRect()
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight

          // 计算按钮中心位置
          const centerX = wrapperRect.left + wrapperRect.width / 2
          let top = wrapperRect.bottom + 8

          // 计算 tooltip 的左边位置（不使用 transform，避免模糊）
          let left = centerX - tooltipRect.width / 2

          // 调整水平位置，确保不超出视口
          if (left < 8) {
            left = 8
          } else if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8
          }

          // 调整垂直位置，确保不超出视口
          if (top + tooltipRect.height > viewportHeight - 8) {
            top = wrapperRect.top - tooltipRect.height - 8
          }

          // 确保位置为整数像素，避免模糊
          setPosition({ 
            top: Math.round(top), 
            left: Math.round(left),
            centerX: Math.round(centerX)
          })
        })
      })
    }
  }, [show])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && content && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2.5 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-xl whitespace-nowrap pointer-events-none font-medium"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            opacity: show ? 1 : 0,
            transition: 'opacity 0.1s ease-out',
          }}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{ 
              top: '-4px',
              left: `${position.centerX - position.left}px`,
              marginLeft: '-4px'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Tooltip

