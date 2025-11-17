// API 工具函数
export function waitForWailsAPI(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkAPI = () => {
      // 在 Wails v2 中，绑定的结构体路径为 window.go.{packageName}.{StructName}
      // 检查 App 结构体（包含所有 API）
      const appAPI = window.go?.app?.App
      
      // 检查直接绑定的各个 API（如果存在）
      // 由于包名冲突，Wails 可能使用完整路径的最后部分
      let jsonAPI = null
      let base64API = null
      let timestampAPI = null
      
      // 尝试查找各个 API（可能的路径）
      if (window.go) {
        // 遍历所有可能的路径
        for (const key in window.go) {
          const pkg = window.go[key]
          if (pkg && typeof pkg === 'object') {
            // 检查是否有 API 结构体
            if (pkg.API) {
              // 根据包名判断是哪个 API
              if (key.includes('json') || (!jsonAPI && !base64API && !timestampAPI)) {
                jsonAPI = jsonAPI || pkg.API
              } else if (key.includes('base64')) {
                base64API = pkg.API
              } else if (key.includes('timestamp')) {
                timestampAPI = pkg.API
              }
            }
          }
        }
      }
      
      // 使用 App 结构体和各个 Handler
      const jsonHandler = window.go?.handlers?.JSONHandler
      const base64Handler = window.go?.handlers?.Base64Handler
      const timestampHandler = window.go?.handlers?.TimestampHandler
      const uuidHandler = window.go?.handlers?.UUIDHandler
      
      if (appAPI) {
        const result = {
          JSON: jsonHandler ? {
            Format: jsonHandler.Format?.bind(jsonHandler),
            FormatWithEscape: jsonHandler.FormatWithEscape?.bind(jsonHandler),
            Minify: jsonHandler.Minify?.bind(jsonHandler),
            Validate: jsonHandler.Validate?.bind(jsonHandler),
            ToYAML: jsonHandler.ToYAML?.bind(jsonHandler),
            FromYAML: jsonHandler.FromYAML?.bind(jsonHandler),
          } : null,
          Base64: base64Handler ? {
            Encode: base64Handler.Encode?.bind(base64Handler),
            EncodeURLSafe: base64Handler.EncodeURLSafe?.bind(base64Handler),
            Decode: base64Handler.Decode?.bind(base64Handler),
            DecodeURLSafe: base64Handler.DecodeURLSafe?.bind(base64Handler),
            Validate: base64Handler.Validate?.bind(base64Handler),
            ValidateURLSafe: base64Handler.ValidateURLSafe?.bind(base64Handler),
          } : null,
          Timestamp: timestampHandler ? {
            TimestampToTimeString: timestampHandler.TimestampToTimeString?.bind(timestampHandler),
            TimeStringToTimestamp: timestampHandler.TimeStringToTimestamp?.bind(timestampHandler),
            TimestampToTimeStringMilli: timestampHandler.TimestampToTimeStringMilli?.bind(timestampHandler),
            TimeStringToTimestampMilli: timestampHandler.TimeStringToTimestampMilli?.bind(timestampHandler),
            FormatNow: timestampHandler.FormatNow?.bind(timestampHandler),
            GetCurrentTimestamp: timestampHandler.GetCurrentTimestamp?.bind(timestampHandler),
            GetCurrentTimestampMilli: timestampHandler.GetCurrentTimestampMilli?.bind(timestampHandler),
          } : null,
          UUID: uuidHandler ? {
            GenerateV1: uuidHandler.GenerateV1?.bind(uuidHandler),
            GenerateV3: uuidHandler.GenerateV3?.bind(uuidHandler),
            GenerateV4: uuidHandler.GenerateV4?.bind(uuidHandler),
            GenerateV5: uuidHandler.GenerateV5?.bind(uuidHandler),
            GenerateBatch: uuidHandler.GenerateBatch?.bind(uuidHandler),
          } : null,
          GetVersion: appAPI.GetVersion?.bind(appAPI),
          GetInitialTool: appAPI.GetInitialTool?.bind(appAPI),
          NavigateToTool: appAPI.NavigateToTool?.bind(appAPI),
        }
        
        // 检查至少有一个方法可用
        if (result.GetVersion || result.JSON?.Format || result.Base64?.Encode || result.Timestamp?.FormatNow || result.UUID?.GenerateV4) {
          resolve(result)
          return
        }
      }
      
      // 如果 App 不可用，尝试直接绑定的 API
      if (jsonAPI || base64API || timestampAPI) {
        resolve({
          JSON: jsonAPI,
          Base64: base64API,
          Timestamp: timestampAPI,
          GetVersion: null,
        })
        return
      }
      
      if (Date.now() - startTime > timeout) {
        // 调试信息：输出 window.go 的完整结构
        console.error('Wails API 未找到')
        console.error('window.go:', window.go)
        console.error('window.go.app:', window.go?.app)
        console.error('window.go.app.App:', window.go?.app?.App)
        if (window.go?.app?.App) {
          console.error('App fields:', Object.keys(window.go.app.App))
        }
        reject(new Error('Wails API 初始化超时'))
        return
      }
      
      setTimeout(checkAPI, 100)
    }
    
    checkAPI()
  })
}

export function getWailsAPI() {
  const appAPI = window.go?.app?.App
  const jsonHandler = window.go?.handlers?.JSONHandler
  const base64Handler = window.go?.handlers?.Base64Handler
  const timestampHandler = window.go?.handlers?.TimestampHandler
  const uuidHandler = window.go?.handlers?.UUIDHandler
  
  if (appAPI) {
    return {
      JSON: jsonHandler ? {
        Format: jsonHandler.Format?.bind(jsonHandler),
        FormatWithEscape: jsonHandler.FormatWithEscape?.bind(jsonHandler),
        Minify: jsonHandler.Minify?.bind(jsonHandler),
        Validate: jsonHandler.Validate?.bind(jsonHandler),
        ToYAML: jsonHandler.ToYAML?.bind(jsonHandler),
        FromYAML: jsonHandler.FromYAML?.bind(jsonHandler),
      } : null,
      Base64: base64Handler ? {
        Encode: base64Handler.Encode?.bind(base64Handler),
        EncodeURLSafe: base64Handler.EncodeURLSafe?.bind(base64Handler),
        Decode: base64Handler.Decode?.bind(base64Handler),
        DecodeURLSafe: base64Handler.DecodeURLSafe?.bind(base64Handler),
        Validate: base64Handler.Validate?.bind(base64Handler),
        ValidateURLSafe: base64Handler.ValidateURLSafe?.bind(base64Handler),
      } : null,
      Timestamp: timestampHandler ? {
        TimestampToTimeString: timestampHandler.TimestampToTimeString?.bind(timestampHandler),
        TimeStringToTimestamp: timestampHandler.TimeStringToTimestamp?.bind(timestampHandler),
        TimestampToTimeStringMilli: timestampHandler.TimestampToTimeStringMilli?.bind(timestampHandler),
        TimeStringToTimestampMilli: timestampHandler.TimeStringToTimestampMilli?.bind(timestampHandler),
        FormatNow: timestampHandler.FormatNow?.bind(timestampHandler),
        GetCurrentTimestamp: timestampHandler.GetCurrentTimestamp?.bind(timestampHandler),
        GetCurrentTimestampMilli: timestampHandler.GetCurrentTimestampMilli?.bind(timestampHandler),
      } : null,
      UUID: uuidHandler ? {
        GenerateV1: uuidHandler.GenerateV1?.bind(uuidHandler),
        GenerateV3: uuidHandler.GenerateV3?.bind(uuidHandler),
        GenerateV4: uuidHandler.GenerateV4?.bind(uuidHandler),
        GenerateV5: uuidHandler.GenerateV5?.bind(uuidHandler),
        GenerateBatch: uuidHandler.GenerateBatch?.bind(uuidHandler),
      } : null,
      GetVersion: appAPI.GetVersion?.bind(appAPI),
      GetInitialTool: appAPI.GetInitialTool?.bind(appAPI),
      NavigateToTool: appAPI.NavigateToTool?.bind(appAPI),
    }
  }
  
  return null
}

