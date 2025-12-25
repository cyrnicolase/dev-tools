/**
 * 工具组件映射配置
 */
import JsonTool from '../tools/json/JsonTool'
import Base64Tool from '../tools/base64/Base64Tool'
import TimestampTool from '../tools/timestamp/TimestampTool'
import UuidTool from '../tools/uuid/UuidTool'
import UrlTool from '../tools/url/UrlTool'
import QrcodeTool from '../tools/qrcode/QrcodeTool'
import IPQueryTool from '../tools/ipquery/IPQueryTool'
import TranslateTool from '../tools/translate/TranslateTool'
import HashTool from '../tools/hash/HashTool'
import HelpTool from '../menus/help/HelpTool'

/**
 * 工具组件映射
 * key: 工具ID
 * value: { component: React组件, className: CSS类名 }
 */
export const TOOL_COMPONENTS = {
  json: {
    component: JsonTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  base64: {
    component: Base64Tool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  timestamp: {
    component: TimestampTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  uuid: {
    component: UuidTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  url: {
    component: UrlTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  qrcode: {
    component: QrcodeTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  ipquery: {
    component: IPQueryTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  translate: {
    component: TranslateTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  hash: {
    component: HashTool,
    className: 'flex-1 min-h-0 flex flex-col',
  },
  help: {
    component: HelpTool,
    className: '',
  },
}

