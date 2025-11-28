import React, { useState, useEffect } from 'react'
import { getWailsAPI, waitForWailsAPI } from '../../utils/api'
import Toast from '../../components/Toast'

function QrcodeTool() {
  const [input, setInput] = useState('')
  const [qrcodeImage, setQrcodeImage] = useState('')
  const [size, setSize] = useState('small') // small, medium, large
  const [api, setApi] = useState(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    waitForWailsAPI()
      .then((wailsAPI) => {
        if (wailsAPI?.QRCode) {
          setApi(wailsAPI)
        }
      })
      .catch(() => {
        setError('后端 API 初始化失败')
      })
  }, [])

  const handleGenerate = async () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('请输入要生成二维码的文本')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.QRCode) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const result = await wailsAPI.QRCode.Generate(input, size)
      if (result) {
        setQrcodeImage(`data:image/png;base64,${result}`)
      }
    } catch (err) {
      setError(err.message || '生成二维码失败')
    }
  }

  const handleDownload = async () => {
    try {
      if (!qrcodeImage) {
        setError('请先生成二维码')
        return
      }
      const wailsAPI = api || getWailsAPI()
      if (!wailsAPI?.QRCode) {
        setError('后端 API 未加载，请稍候重试')
        return
      }
      const imageData = await wailsAPI.QRCode.GenerateImage(input, size)
      if (imageData) {
        // 创建 Blob 对象
        const blob = new Blob([imageData], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `qrcode-${size}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setShowToast(true)
      }
    } catch (err) {
      setError(err.message || '下载失败')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">二维码工具</h2>
        <p className="text-gray-600 text-sm select-none">生成二维码图片</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 select-none">输入</h3>
          <div className="flex items-center space-x-6">
            {/* 左侧：尺寸选择 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 select-none">尺寸：</span>
              <button
                onClick={() => setSize('small')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                  size === 'small'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                小
              </button>
              <button
                onClick={() => setSize('medium')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                  size === 'medium'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                中
              </button>
              <button
                onClick={() => setSize('large')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm select-none ${
                  size === 'large'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                大
              </button>
            </div>
            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2 border-l border-gray-300 pl-6">
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium select-none"
              >
                生成
              </button>
            </div>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入要生成二维码的文本..."
        />
        {error && (
          <div className="mt-2 p-3 rounded-lg bg-red-50 text-red-700 select-none">
            {error}
          </div>
        )}
      </div>

      {qrcodeImage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 select-none">二维码</h3>
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors select-none"
              title="下载"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
          <div className="flex justify-center items-center">
            <img
              src={qrcodeImage}
              alt="二维码"
              className="max-w-full h-auto border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}
      <Toast
        message="已下载到本地"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default QrcodeTool

