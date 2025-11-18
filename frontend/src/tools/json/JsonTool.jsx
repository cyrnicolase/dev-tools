import React from 'react'
import JsonFormatter from './JsonFormatter'

function JsonTool() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 select-none">JSON 工具</h2>
        <p className="text-gray-600 text-sm select-none">格式化、验证和转换 JSON 数据</p>
      </div>
      <JsonFormatter />
    </div>
  )
}

export default JsonTool

