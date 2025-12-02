import React from 'react'
import JsonFormatter from './JsonFormatter'
import ToolHeader from '../../components/ToolHeader'

function JsonTool({ onShowHelp }) {
  return (
    <div className="h-full flex flex-col">
      <ToolHeader
        title="JSON 工具"
        description="格式化、验证和转换 JSON 数据"
        toolId="json"
        onShowHelp={onShowHelp}
      />
      <div className="flex-1 min-h-0">
        <JsonFormatter />
      </div>
    </div>
  )
}

export default JsonTool

