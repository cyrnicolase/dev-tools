import React from 'react'
import JsonFormatter from './JsonFormatter'

function JsonTool() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">JSON 工具</h2>
        <p className="text-gray-600 text-sm select-none">格式化、验证和转换 JSON 数据</p>
      </div>
      <div className="flex-1 min-h-0">
        <JsonFormatter />
      </div>
    </div>
  )
}

export default JsonTool

