import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'
import Tooltip from '../../components/Tooltip'
import SearchBar from '../../components/SearchBar'
import { searchJsonKeys } from '../../utils/jsonSearch'
import { useTheme } from '../../hooks/useTheme'

function JsonFormatter({ isActive = true }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [api, setApi] = useState(null)
  const [inputMaximizeMode, setInputMaximizeMode] = useState('none') // 'none', 'fullscreen', 'content'
  const [preserveEscape, setPreserveEscape] = useState(true) // 默认保留转义
  const [lastFormattedInput, setLastFormattedInput] = useState('') // 保存最后一次格式化的输入（用于重新格式化）
  const [outputFormat, setOutputFormat] = useState('json') // 'json' 或 'yaml'
  const [isMinified, setIsMinified] = useState(false) // 当前输出是否是压缩格式
  const [isFormatted, setIsFormatted] = useState(false) // 是否已格式化
  const [showToast, setShowToast] = useState(false) // 是否显示 Toast 提示
  const [toastMessage, setToastMessage] = useState('已复制到剪贴板') // Toast 消息内容
  
  // 搜索相关状态
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [regex, setRegex] = useState(false)
  const [jsonMode, setJsonMode] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [jsonMatches, setJsonMatches] = useState([])
  
  // Monaco Editor 引用
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const decorationsRef = useRef([])
  const searchBarRef = useRef(null)
  const savedPositionRef = useRef(null) // 保存关闭搜索框前的光标位置
  const apiRef = useRef(null) // 存储 API 引用，供快捷键使用
  
  // 主题
  const { theme } = useTheme()

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.JSON) {
          setApi(wailsAPI)
          apiRef.current = wailsAPI
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  // 当 preserveEscape 变化时，如果已格式化，自动重新格式化
  useEffect(() => {
    // 只在 preserveEscape 变化且已格式化时重新格式化
    if (!isFormatted || !lastFormattedInput || !api?.JSON) {
      return
    }
    
    const reFormat = async () => {
      try {
        const wailsAPI = api || getWailsAPI()
        if (!wailsAPI?.JSON?.FormatWithEscape) {
          return
        }
        const result = await wailsAPI.JSON.FormatWithEscape(lastFormattedInput, preserveEscape)
        if (result) {
          setInput(result)
          setLastFormattedInput(result)
        }
      } catch (err) {
        // 静默处理错误，避免控制台噪音
      }
    }
    reFormat()
  }, [preserveEscape, isFormatted, lastFormattedInput, api])

  const handleFormat = async (useRefValues = false) => {
    try {
      setError('')
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      // 如果 useRefValues 为 true，使用 ref 中的最新值（用于快捷键调用）
      const currentInput = useRefValues ? inputRef.current : input
      const currentPreserveEscape = useRefValues ? preserveEscapeRef.current : preserveEscape
      // 使用 FormatWithEscape 方法，传入 preserveEscape 参数
      const result = await wailsAPI.JSON.FormatWithEscape(currentInput, currentPreserveEscape)
      if (result) {
        setInput(result)
        setLastFormattedInput(result) // 保存格式化后的输入（用于重新格式化）
        setOutputFormat('json') // 重置为 JSON 格式
        setIsMinified(false) // 格式化后不是压缩格式
        setIsFormatted(true) // 标记为已格式化
      }
    } catch (err) {
      setError(err.message || '格式化失败')
    }
  }

  const handleToggleMinify = async () => {
    try {
      setError('')
      if (!input || !isFormatted) {
        setError('请先格式化 JSON')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      
      // 只在 JSON 格式下才能压缩/格式化
      if (outputFormat !== 'json') {
        setError('请先将 YAML 转换为 JSON')
        return
      }
      
      let result
      if (isMinified) {
        // 当前是压缩格式，转换为格式化
        // 使用当前的input（可能是压缩后的JSON，也可能是用户编辑后的内容）来格式化
        result = await wailsAPI.JSON.FormatWithEscape(input, preserveEscape)
        if (result) {
          setInput(result)
          setLastFormattedInput(result)
          setIsMinified(false)
        }
      } else {
        // 当前是格式化格式，转换为压缩
        // 使用当前的input（可能是格式化后的JSON，也可能是用户编辑后的内容）来压缩
        result = await wailsAPI.JSON.Minify(input)
        if (result) {
          setInput(result)
          // 压缩时不更新 lastFormattedInput，保持原始的格式化JSON用于后续格式化
          setIsMinified(true)
        }
      }
    } catch (err) {
      setError(err.message || '转换失败')
    }
  }

  const handleToggleYAML = async () => {
    try {
      setError('')
      if (!input || !isFormatted) {
        setError('请先格式化 JSON')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      
      let result
      if (outputFormat === 'json') {
        // 当前是 JSON，转换为 YAML
        result = await wailsAPI.JSON.ToYAML(input)
        if (result) {
          setInput(result)
          setLastFormattedInput(result)
          setOutputFormat('yaml')
          setIsMinified(false) // YAML 格式不是压缩格式
        } else {
          setError('转换失败：返回结果为空')
        }
      } else {
        // 当前是 YAML，转换回 JSON
        if (!wailsAPI.JSON.FromYAML) {
          setError('YAML 转 JSON 功能不可用，请检查后端 API')
          return
        }
        result = await wailsAPI.JSON.FromYAML(input)
        if (result) {
          setInput(result)
          setLastFormattedInput(result)
          setOutputFormat('json')
          setIsMinified(false) // YAML 转 JSON 后是格式化格式
        } else {
          setError('转换失败：返回结果为空')
        }
      }
    } catch (err) {
      // 尝试提取更详细的错误信息
      let errorMsg = '转换失败'
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMsg = err.message
        } else if (err.toString) {
          errorMsg = err.toString()
        }
      } else if (typeof err === 'string') {
        errorMsg = err
      }
      setError(errorMsg)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input)
      setToastMessage('已复制到剪贴板')
      setShowToast(true)
    } catch (err) {
      setError('复制失败')
    }
  }

  // 通用的保存函数，可以被按钮和快捷键调用
  const performSave = useCallback(async (content) => {
    try {
      setError('')
      if (!content || !content.trim()) {
        setError('输入框为空，无法保存')
        return
      }
      // 优先使用 ref 中的 API（用于快捷键调用），否则使用 state 中的 API
      const wailsAPI = apiRef.current || api || getWailsAPI()
      if (!wailsAPI?.JSON) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      if (!wailsAPI.JSON.SaveFileDialog) {
        setError('保存功能不可用，请重新编译应用')
        return
      }
      await wailsAPI.JSON.SaveFileDialog(content)
      setToastMessage('文件已保存')
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
      }, 2000)
    } catch (err) {
      // 如果用户取消保存，不显示错误
      if (err.message && !err.message.includes('取消') && !err.message.includes('cancelled')) {
        setError(err.message || '保存失败')
      }
    }
  }, [])

  const handleSave = async () => {
    // 获取当前编辑器内容（确保是最新的）
    const currentContent = editorRef.current?.getModel()?.getValue() || input
    await performSave(currentContent)
  }

  const handleClear = () => {
    setInput('')
    setError('')
    setIsFormatted(false)
    setLastFormattedInput('')
    setOutputFormat('json')
    setIsMinified(false)
    // 清除搜索
    if (showSearch) {
      setShowSearch(false)
      clearSearch()
    }
  }

  const handleInputMaximizeFullscreen = () => {
    setInputMaximizeMode('fullscreen')
  }

  const handleInputMaximizeContent = () => {
    setInputMaximizeMode('content')
  }

  const handleRestoreInput = () => {
    setInputMaximizeMode('none')
  }

  // 当用户编辑输入框时，标记为未格式化状态
  const handleInputChange = (value) => {
    setInput(value || '')
    // 用户编辑内容后，标记为未格式化状态
    setIsFormatted(false)
    // 如果用户编辑了内容，且当前不是压缩状态，更新 lastFormattedInput 以便重新格式化
    // 如果是压缩状态，不更新 lastFormattedInput，保持原始的格式化JSON用于后续格式化
    if (!isMinified) {
      setLastFormattedInput(value || '')
    }
    // 如果正在搜索，更新搜索结果
    if (showSearch && searchTerm) {
      performSearch(value || '', searchTerm, caseSensitive, regex, jsonMode)
    }
  }
  
  // 使用 ref 存储最新状态，供快捷键使用
  const showSearchRef = useRef(showSearch)
  const searchTermRef = useRef(searchTerm)
  const inputRef = useRef(input)
  const preserveEscapeRef = useRef(preserveEscape)
  
  useEffect(() => {
    showSearchRef.current = showSearch
  }, [showSearch])
  
  useEffect(() => {
    searchTermRef.current = searchTerm
  }, [searchTerm])
  
  useEffect(() => {
    inputRef.current = input
  }, [input])
  
  useEffect(() => {
    preserveEscapeRef.current = preserveEscape
  }, [preserveEscape])
  
  // 当 isActive 变为 true 时，自动聚焦编辑器
  useEffect(() => {
    if (isActive && !showSearch) {
      const focusEditor = () => {
        if (editorRef.current) {
          try {
            const container = editorRef.current.getContainerDomNode()
            if (container) {
              const rect = container.getBoundingClientRect()
              const isVisible = rect.width > 0 && rect.height > 0
              if (isVisible) {
                editorRef.current.focus()
                return true
              }
            }
            return false
          } catch (err) {
            return false
          }
        }
        return false
      }
      
      let attempts = 0
      const maxAttempts = 10
      const tryFocus = () => {
        attempts++
        if (focusEditor() || attempts >= maxAttempts) {
          return
        }
        setTimeout(tryFocus, 50)
      }
      requestAnimationFrame(() => {
        setTimeout(tryFocus, 100)
      })
    }
  }, [isActive, showSearch])
  
  // Monaco Editor 初始化
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    
    // 禁用格式化快捷键（Shift+Alt+F / Shift+Option+F）
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      // 禁用自动格式化，不执行任何操作
    })
    
    // 注册快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      if (showSearchRef.current) {
        // 搜索框已显示，聚焦并选中搜索框内容
        if (searchBarRef.current) {
          searchBarRef.current.focusAndSelect()
        }
      } else {
        // 搜索框未显示，保存当前光标位置并显示搜索框
        if (editorRef.current) {
          const position = editorRef.current.getPosition()
          if (position) {
            savedPositionRef.current = position
          }
        }
        setShowSearch(true)
      }
    })
    
    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (showSearchRef.current) {
        setShowSearch(false)
        clearSearch()
        // 恢复光标位置
        if (editorRef.current && savedPositionRef.current) {
          setTimeout(() => {
            if (editorRef.current && savedPositionRef.current) {
              editorRef.current.setPosition(savedPositionRef.current)
              editorRef.current.focus()
              savedPositionRef.current = null
            }
          }, 0)
        }
      }
    })
    
    editor.addCommand(monaco.KeyCode.F3, () => {
      if (showSearchRef.current && searchTermRef.current) {
        handleNextMatch()
      }
    })
    
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F3, () => {
      if (showSearchRef.current && searchTermRef.current) {
        handlePreviousMatch()
      }
    })
    
    // 注册 Cmd+Enter 快捷键执行格式化操作
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // 如果搜索框显示，不执行格式化
      if (!showSearchRef.current) {
        // 从编辑器的 model 中获取当前内容，确保获取最新值
        const model = editor.getModel()
        if (model) {
          const currentInput = model.getValue()
          // 使用 ref 中的最新 preserveEscape 值
          const currentPreserveEscape = preserveEscapeRef.current
          // 直接调用格式化逻辑
          const formatAsync = async () => {
            try {
              setError('')
              // 优先使用 ref 中的 API，如果没有则尝试获取
              const wailsAPI = apiRef.current || getWailsAPI()
              if (!wailsAPI?.JSON) {
                setError('后端 API 未加载，请稍候重试')
                return
              }
              const result = await wailsAPI.JSON.FormatWithEscape(currentInput, currentPreserveEscape)
              if (result) {
                setInput(result)
                setLastFormattedInput(result)
                setOutputFormat('json')
                setIsMinified(false)
                setIsFormatted(true)
              }
            } catch (err) {
              setError(err.message || '格式化失败')
            }
          }
          formatAsync()
        }
      }
    })

    // 注册 Cmd+S 快捷键执行保存操作
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // 如果搜索框显示，不执行保存
      if (!showSearchRef.current) {
        const currentContent = editor.getModel()?.getValue() || inputRef.current
        performSave(currentContent)
      }
    })
  }
  
  // 清除搜索高亮
  const clearSearchHighlights = useCallback(() => {
    if (editorRef.current && decorationsRef.current.length > 0) {
      editorRef.current.deltaDecorations(decorationsRef.current, [])
      decorationsRef.current = []
    }
  }, [])
  
  // 高亮 JSON 匹配项
  const highlightJsonMatches = useCallback((matches, text) => {
    if (!editorRef.current || !monacoRef.current) return
    
    const editor = editorRef.current
    const model = editor.getModel()
    const lines = text.split('\n')
    
    const decorations = []
    
    matches.forEach((match) => {
      const { path, type, key } = match
      
      // 尝试找到匹配的行和列
      if (type === 'key' && key) {
        const keyPattern = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`, 'g')
        lines.forEach((line, lineIndex) => {
          let matchResult
          while ((matchResult = keyPattern.exec(line)) !== null) {
            const startColumn = matchResult.index + 1
            const endColumn = startColumn + key.length + 2
            decorations.push({
              range: new monacoRef.current.Range(lineIndex + 1, startColumn, lineIndex + 1, endColumn),
              options: {
                inlineClassName: 'monaco-search-match',
                className: 'monaco-search-match',
              },
            })
          }
        })
      } else if (type === 'value') {
        const valueStr = String(match.value)
        const escapedValue = valueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const valuePattern = new RegExp(`:\\s*"${escapedValue}"`, 'g')
        lines.forEach((line, lineIndex) => {
          let matchResult
          while ((matchResult = valuePattern.exec(line)) !== null) {
            const valueStart = matchResult.index + matchResult[0].indexOf('"') + 1
            const valueEnd = valueStart + valueStr.length + 2
            decorations.push({
              range: new monacoRef.current.Range(lineIndex + 1, valueStart, lineIndex + 1, valueEnd),
              options: {
                inlineClassName: 'monaco-search-match',
                className: 'monaco-search-match',
              },
            })
          }
        })
      }
    })
    
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations)
  }, [])
  
  // 导航到 JSON 匹配项
  const navigateToJsonMatch = useCallback((match) => {
    if (!editorRef.current || !monacoRef.current || !match) return
    
    const editor = editorRef.current
    const model = editor.getModel()
    const text = model.getValue()
    const lines = text.split('\n')
    
    // 尝试找到匹配的位置
    if (match.type === 'key' && match.key) {
      const keyPattern = new RegExp(`"${match.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`, 'g')
      for (let i = 0; i < lines.length; i++) {
        const matchResult = keyPattern.exec(lines[i])
        if (matchResult) {
          const startColumn = matchResult.index + 1
          const endColumn = startColumn + match.key.length + 2
          const range = new monacoRef.current.Range(i + 1, startColumn, i + 1, endColumn)
          editor.setPosition(range.getStartPosition())
          editor.revealRangeInCenter(range)
          editor.setSelection(range)
          break
        }
      }
    }
  }, [])
  
  // 文本搜索
  const performTextSearch = useCallback((term, caseSens, useRegex) => {
    if (!editorRef.current || !monacoRef.current) return
    
    const editor = editorRef.current
    const model = editor.getModel()
    
    try {
      const matches = model.findMatches(term, false, useRegex, caseSens, null, false)
      setMatchCount(matches.length)
      setJsonMatches([])
      
      if (matches.length > 0) {
        // 高亮所有匹配项
        const decorations = matches.map(match => ({
          range: match.range,
          options: {
            inlineClassName: 'monaco-search-match',
            className: 'monaco-search-match',
          },
        }))
        
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations)
        
        // 导航到当前匹配项
        const currentIdx = currentMatchIndex < matches.length ? currentMatchIndex : 0
        if (currentIdx < matches.length) {
          const match = matches[currentIdx]
          editor.setPosition(match.range.getStartPosition())
          editor.revealRangeInCenter(match.range)
          editor.setSelection(match.range)
        }
      } else {
        clearSearchHighlights()
      }
    } catch (err) {
      console.error('搜索错误:', err)
      setMatchCount(0)
      clearSearchHighlights()
    }
  }, [currentMatchIndex, clearSearchHighlights])
  
  // 执行搜索
  const performSearch = useCallback((text, term, caseSens, useRegex, jsonSearchMode) => {
    if (!editorRef.current || !monacoRef.current || !term) {
      setMatchCount(0)
      setCurrentMatchIndex(0)
      setJsonMatches([])
      clearSearchHighlights()
      return
    }
    
    const editor = editorRef.current
    const model = editor.getModel()
    
    if (jsonSearchMode && outputFormat === 'json') {
      // JSON 键值搜索
      try {
        const jsonObj = JSON.parse(text)
        const matches = searchJsonKeys(jsonObj, term, caseSens, useRegex)
        setJsonMatches(matches)
        setMatchCount(matches.length)
        
        if (matches.length > 0) {
          // 高亮 JSON 匹配项
          highlightJsonMatches(matches, text)
          // 导航到第一个匹配项
          const currentIdx = currentMatchIndex < matches.length ? currentMatchIndex : 0
          setCurrentMatchIndex(currentIdx)
          navigateToJsonMatch(matches[currentIdx])
        } else {
          clearSearchHighlights()
        }
      } catch (err) {
        // JSON 解析失败，回退到文本搜索
        performTextSearch(term, caseSens, useRegex)
      }
    } else {
      // 文本搜索
      performTextSearch(term, caseSens, useRegex)
    }
  }, [outputFormat, currentMatchIndex, clearSearchHighlights, highlightJsonMatches, navigateToJsonMatch, performTextSearch])
  
  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setMatchCount(0)
    setCurrentMatchIndex(0)
    setJsonMatches([])
    clearSearchHighlights()
  }, [clearSearchHighlights])
  
  // 搜索词变化
  useEffect(() => {
    if (showSearch && searchTerm) {
      performSearch(input, searchTerm, caseSensitive, regex, jsonMode)
    } else if (!searchTerm) {
      clearSearch()
    }
  }, [searchTerm, caseSensitive, regex, jsonMode, showSearch, input, performSearch, clearSearch])
  
  // 导航到下一个匹配项
  const handleNextMatch = useCallback(() => {
    if (matchCount === 0) return
    
    const nextIndex = (currentMatchIndex + 1) % matchCount
    setCurrentMatchIndex(nextIndex)
    
    if (jsonMode && jsonMatches.length > 0) {
      navigateToJsonMatch(jsonMatches[nextIndex])
    } else if (editorRef.current) {
      const editor = editorRef.current
      const model = editor.getModel()
      const matches = model.findMatches(searchTerm, false, regex, caseSensitive, null, false)
      if (matches[nextIndex]) {
        editor.setPosition(matches[nextIndex].range.getStartPosition())
        editor.revealRangeInCenter(matches[nextIndex].range)
        editor.setSelection(matches[nextIndex].range)
      }
    }
  }, [matchCount, currentMatchIndex, jsonMode, jsonMatches, searchTerm, regex, caseSensitive, navigateToJsonMatch])
  
  // 导航到上一个匹配项
  const handlePreviousMatch = useCallback(() => {
    if (matchCount === 0) return
    
    const prevIndex = (currentMatchIndex - 1 + matchCount) % matchCount
    setCurrentMatchIndex(prevIndex)
    
    if (jsonMode && jsonMatches.length > 0) {
      navigateToJsonMatch(jsonMatches[prevIndex])
    } else if (editorRef.current) {
      const editor = editorRef.current
      const model = editor.getModel()
      const matches = model.findMatches(searchTerm, false, regex, caseSensitive, null, false)
      if (matches[prevIndex]) {
        editor.setPosition(matches[prevIndex].range.getStartPosition())
        editor.revealRangeInCenter(matches[prevIndex].range)
        editor.setSelection(matches[prevIndex].range)
      }
    }
  }, [matchCount, currentMatchIndex, jsonMode, jsonMatches, searchTerm, regex, caseSensitive, navigateToJsonMatch])
  
  // 关闭搜索
  const handleCloseSearch = useCallback(() => {
    setShowSearch(false)
    clearSearch()
    // 恢复光标位置
    if (editorRef.current && savedPositionRef.current) {
      setTimeout(() => {
        if (editorRef.current && savedPositionRef.current) {
          editorRef.current.setPosition(savedPositionRef.current)
          editorRef.current.focus()
          savedPositionRef.current = null
        }
      }, 0)
    } else if (editorRef.current) {
      // 如果没有保存的位置，直接聚焦编辑器
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus()
        }
      }, 0)
    }
  }, [clearSearch])

  const isInputMaximized = inputMaximizeMode !== 'none'
  const isInputFullscreen = inputMaximizeMode === 'fullscreen'
  const isInputContentMaximized = inputMaximizeMode === 'content'

  // 如果非激活状态，使用 display: none 隐藏（保持状态但不渲染）
  if (!isActive) {
    return <div className="hidden" />
  }

  return (
    <div className={`h-full flex flex-col ${
      isInputFullscreen
        ? 'fixed inset-0 z-50 bg-secondary p-0 overflow-auto' 
        : isInputContentMaximized
        ? 'fixed right-0 top-0 bottom-0 left-64 z-40 bg-secondary p-0 overflow-auto' 
        : ''
    }`}>
      <div className={`bg-secondary flex flex-col ${
        isInputMaximized 
          ? 'h-full p-4' 
          : 'flex-1 min-h-0 rounded-lg shadow-sm border border-border-primary p-6'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preserveEscape}
                onChange={(e) => setPreserveEscape(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-border-input rounded focus:ring-blue-500"
              />
              <span className="text-sm text-[var(--text-primary)] select-none">保留转义</span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors select-none"
            >
              格式化
            </button>
            <Tooltip content={input && isFormatted ? (isMinified ? "格式化 JSON" : "压缩 JSON") : "请先格式化 JSON"} delay={200}>
              <button
                onClick={handleToggleMinify}
                disabled={!input || !isFormatted || outputFormat !== 'json'}
                className={`p-2 rounded-lg transition-colors select-none ${
                  input && isFormatted && outputFormat === 'json'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-button-secondary text-[var(--text-tertiary)] cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content={input && isFormatted ? (outputFormat === 'json' ? "转换为 YAML" : "转换回 JSON") : "请先格式化 JSON"} delay={200}>
              <button
                onClick={handleToggleYAML}
                disabled={!input || !isFormatted}
                className={`p-2 rounded-lg transition-colors select-none ${
                  input && isFormatted
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-button-secondary text-[var(--text-tertiary)] cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </Tooltip>
            {isInputMaximized ? (
              <Tooltip content="恢复" delay={200}>
                <button
                  onClick={handleRestoreInput}
                  className="p-2 bg-button-secondary text-button-secondary-text rounded-lg hover:bg-[var(--button-secondary-hover)] transition-colors select-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </button>
              </Tooltip>
            ) : (
              <>
                <Tooltip content="内容区最大化" delay={200}>
                  <button
                    onClick={handleInputMaximizeContent}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4-4m0 0l4 4m-4-4v12M21 8l-4-4m0 0l-4 4m4-4v12M3 16l4 4m0 0l4-4m-4 4V4m14 12l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip content="全屏最大化" delay={200}>
                  <button
                    onClick={handleInputMaximizeFullscreen}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip content="搜索 (Ctrl+F)" delay={200}>
              <button
                onClick={() => {
                  if (!showSearch) {
                    // 打开搜索框前，保存当前光标位置
                    if (editorRef.current) {
                      const position = editorRef.current.getPosition()
                      if (position) {
                        savedPositionRef.current = position
                      }
                    }
                  }
                  setShowSearch(!showSearch)
                }}
                className={`p-2 rounded-lg transition-colors select-none ${
                  showSearch
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="清空" delay={200}>
              <button
                onClick={handleClear}
                disabled={!input}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="保存 (Cmd+S)" delay={200}>
              <button
                onClick={handleSave}
                disabled={!input || !input.trim()}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="复制" delay={200}>
              <button
                onClick={handleCopy}
                disabled={!input}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
        {showSearch && (
          <SearchBar
            ref={searchBarRef}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPrevious={handlePreviousMatch}
            onNext={handleNextMatch}
            onClose={handleCloseSearch}
            matchCount={matchCount}
            currentMatch={currentMatchIndex + 1}
            caseSensitive={caseSensitive}
            onCaseSensitiveChange={setCaseSensitive}
            regex={regex}
            onRegexChange={setRegex}
            jsonMode={jsonMode}
            onJsonModeChange={setJsonMode}
          />
        )}
        <div className="flex-1 min-h-0 border border-border-input rounded-lg overflow-hidden">
          <Editor
            height="100%"
            language={outputFormat === 'json' ? 'json' : 'yaml'}
            value={input}
            onChange={handleInputChange}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: false,
              formatOnType: false,
              formatOnBlur: false,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
            }}
          />
        </div>
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-error-bg text-error-text select-none">
            {error}
          </div>
        )}
      </div>
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default JsonFormatter
