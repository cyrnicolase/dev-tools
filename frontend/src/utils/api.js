// API 工具函数
export function waitForWailsAPI(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkAPI = () => {
      // 在 Wails v2 中，绑定的结构体路径为 window.go.{packageName}.{StructName}
      // 检查 App 结构体（包含所有 API）
      const appAPI = window.go?.app?.App
      
      // 使用 App 结构体和各个 Handler
      const jsonHandler = window.go?.handlers?.JSONHandler
      const base64Handler = window.go?.handlers?.Base64Handler
      const timestampHandler = window.go?.handlers?.TimestampHandler
      const uuidHandler = window.go?.handlers?.UUIDHandler
      const urlHandler = window.go?.handlers?.URLHandler
      const qrcodeHandler = window.go?.handlers?.QRCodeHandler
      const ipqueryHandler = window.go?.handlers?.IPQueryHandler
      const translateHandler = window.go?.handlers?.TranslateHandler
      
      if (appAPI) {
        const result = {
          JSON: jsonHandler ? {
            Format: jsonHandler.Format?.bind(jsonHandler),
            FormatWithEscape: jsonHandler.FormatWithEscape?.bind(jsonHandler),
            Minify: jsonHandler.Minify?.bind(jsonHandler),
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
          URL: urlHandler ? {
            Encode: urlHandler.Encode?.bind(urlHandler),
            Decode: urlHandler.Decode?.bind(urlHandler),
          } : null,
          QRCode: qrcodeHandler ? {
            Generate: qrcodeHandler.Generate?.bind(qrcodeHandler),
            GenerateImage: qrcodeHandler.GenerateImage?.bind(qrcodeHandler),
          } : null,
          IPQuery: ipqueryHandler ? {
            Query: ipqueryHandler.Query?.bind(ipqueryHandler),
          } : null,
          Translate: translateHandler ? {
            Translate: translateHandler.Translate?.bind(translateHandler),
            GetProviders: translateHandler.GetProviders?.bind(translateHandler),
            GetDefaultProvider: translateHandler.GetDefaultProvider?.bind(translateHandler),
            SetDefaultProvider: translateHandler.SetDefaultProvider?.bind(translateHandler),
            GetProviderConfig: translateHandler.GetProviderConfig?.bind(translateHandler),
            SaveProviderConfig: translateHandler.SaveProviderConfig?.bind(translateHandler),
          } : null,
          GetVersion: appAPI.GetVersion?.bind(appAPI),
          GetInitialTool: appAPI.GetInitialTool?.bind(appAPI),
          NavigateToTool: appAPI.NavigateToTool?.bind(appAPI),
          ClearInitialTool: appAPI.ClearInitialTool?.bind(appAPI),
          GetTheme: appAPI.GetTheme?.bind(appAPI),
          SetTheme: appAPI.SetTheme?.bind(appAPI),
        }
        
        // 检查至少有一个方法可用
        if (result.GetVersion || result.JSON?.Format || result.Base64?.Encode || result.Timestamp?.FormatNow || result.UUID?.GenerateV4 || result.URL?.Encode || result.QRCode?.Generate || result.IPQuery?.Query || result.Translate?.Translate) {
          resolve(result)
          return
        }
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
  const urlHandler = window.go?.handlers?.URLHandler
  const qrcodeHandler = window.go?.handlers?.QRCodeHandler
  const ipqueryHandler = window.go?.handlers?.IPQueryHandler
  const translateHandler = window.go?.handlers?.TranslateHandler
  
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
      URL: urlHandler ? {
        Encode: urlHandler.Encode?.bind(urlHandler),
        Decode: urlHandler.Decode?.bind(urlHandler),
      } : null,
      QRCode: qrcodeHandler ? {
        Generate: qrcodeHandler.Generate?.bind(qrcodeHandler),
        GenerateImage: qrcodeHandler.GenerateImage?.bind(qrcodeHandler),
      } : null,
      IPQuery: ipqueryHandler ? {
        Query: ipqueryHandler.Query?.bind(ipqueryHandler),
      } : null,
      Translate: translateHandler ? {
        Translate: translateHandler.Translate?.bind(translateHandler),
        GetProviders: translateHandler.GetProviders?.bind(translateHandler),
        GetDefaultProvider: translateHandler.GetDefaultProvider?.bind(translateHandler),
        SetDefaultProvider: translateHandler.SetDefaultProvider?.bind(translateHandler),
        GetProviderConfig: translateHandler.GetProviderConfig?.bind(translateHandler),
        SaveProviderConfig: translateHandler.SaveProviderConfig?.bind(translateHandler),
      } : null,
      GetVersion: appAPI.GetVersion?.bind(appAPI),
      GetInitialTool: appAPI.GetInitialTool?.bind(appAPI),
      NavigateToTool: appAPI.NavigateToTool?.bind(appAPI),
      ClearInitialTool: appAPI.ClearInitialTool?.bind(appAPI),
      GetTheme: appAPI.GetTheme?.bind(appAPI),
      SetTheme: appAPI.SetTheme?.bind(appAPI),
    }
  }
  
  return null
}

