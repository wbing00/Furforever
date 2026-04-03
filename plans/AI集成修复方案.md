# AI集成修复方案

## 问题确认
从日志中确认AI调用失败的具体原因：
```
2026-03-27T07:07:01.700Z generateAiSummaryByDoubao fallback to rule: doubao status 404:
```

**HTTP 404错误**表明API端点不存在或无法访问。

## 当前配置分析
当前硬编码的配置：
- **API端点**: `https://ark.cn-beijing.volces.com/api/v3`
- **API密钥**: `74b824c5-d2a7-46ca-a8cc-413631383828`
- **模型**: `ep-20260325215224-fvddl`

## 修复方案

### 方案1：更新为有效的火山引擎API（推荐）

#### 步骤1：获取正确的API配置
1. 访问火山引擎控制台：https://console.volcengine.com/
2. 进入「模型服务」->「模型接入」
3. 选择豆包大模型，获取：
   - 正确的API端点
   - 有效的API密钥
   - 可用的模型名称

#### 步骤2：更新云函数配置
修改`cloudfunctions/petFunctions/index.js`中的配置：

```javascript
// 方案1：使用环境变量（推荐）
const DOUBAO_API_URL = process.env.DOUBAO_API_URL || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || "your-new-api-key-here";
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || "doubao-pro-32k";

// 方案2：直接更新硬编码值
const DOUBAO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DOUBAO_API_KEY = "your-new-api-key-here";
const DOUBAO_MODEL = "doubao-pro-32k";
```

#### 步骤3：设置环境变量
在云开发控制台中设置环境变量：
1. 进入「云函数」->「petFunctions」->「环境配置」
2. 添加以下环境变量：
   - `DOUBAO_API_URL`: 正确的API端点
   - `DOUBAO_API_KEY`: 有效的API密钥
   - `DOUBAO_MODEL`: 可用的模型名称

### 方案2：切换到OpenAI API（备用方案）

如果火山引擎API不可用，可以切换到OpenAI：

#### 步骤1：修改AI调用函数
创建新的AI调用函数：

```javascript
const generateAiSummaryByOpenAI = async (record) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const OPENAI_MODEL = "gpt-3.5-turbo";

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const promptData = buildAiInputFromRecord(record);
  const payload = {
    model: OPENAI_MODEL,
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: "You are a pet health recording assistant. Based on the user's daily records, output concise Chinese JSON, no markdown, no additional explanations. Do not provide medical diagnosis or prescription advice."
      },
      {
        role: "user",
        content: `Please generate a health summary based on the following records.\nRecord data: ${JSON.stringify(promptData)}\nOutput JSON format: {"summary":"30-120 characters","alerts":["string array"],"alertLevel":"normal or warning"}`
      }
    ]
  };

  // 调用OpenAI API
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // 解析和返回结果（与原有逻辑相同）
  const parsed = safeParseJsonFromText(content);
  if (!parsed || typeof parsed.summary !== "string") {
    throw new Error("OpenAI output invalid");
  }

  return {
    summary: parsed.summary.trim(),
    alerts: Array.isArray(parsed.alerts) ? parsed.alerts.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()) : [],
    alertLevel: parsed.alertLevel === "warning" ? "warning" : "normal"
  };
};
```

#### 步骤2：更新generateDailyInsights函数
修改调用逻辑，支持多种AI服务：

```javascript
// 在generateDailyInsights函数中
let aiSucceeded = false;
let summarySource = "rule";
let aiAlerts = [];
let aiAlertLevel = "normal";

// 尝试多种AI服务
try {
  // 首先尝试火山引擎
  const aiResult = await generateAiSummaryByDoubao(currentRecord);
  summary = aiResult.summary || summary;
  aiAlerts = aiResult.alerts || [];
  aiAlertLevel = aiResult.alertLevel || "normal";
  summarySource = "ai";
  aiSucceeded = true;
} catch (doubaoErr) {
  console.warn("Doubao API failed, trying OpenAI:", doubaoErr.message);
  
  try {
    // 降级到OpenAI
    const aiResult = await generateAiSummaryByOpenAI(currentRecord);
    summary = aiResult.summary || summary;
    aiAlerts = aiResult.alerts || [];
    aiAlertLevel = aiResult.alertLevel || "normal";
    summarySource = "ai";
    aiSucceeded = true;
  } catch (openaiErr) {
    console.warn("OpenAI API also failed, using rule engine:", openaiErr.message);
    summarySource = "rule";
  }
}
```

### 方案3：增强错误处理和日志

#### 改进错误日志：
```javascript
// 在generateAiSummaryByDoubao函数中添加详细日志
const generateAiSummaryByDoubao = async (record) => {
  console.log("Starting Doubao API call with config:", {
    apiUrl: DOUBAO_API_URL,
    hasApiKey: !!DOUBAO_API_KEY,
    model: DOUBAO_MODEL,
    recordData: buildAiInputFromRecord(record)
  });

  if (!DOUBAO_API_KEY || !DOUBAO_MODEL) {
    console.error("Doubao environment missing: DOUBAO_API_KEY or DOUBAO_MODEL");
    throw new Error("doubao env missing: DOUBAO_API_KEY / DOUBAO_MODEL");
  }

  // ... 原有代码
};
```

#### 添加API健康检查：
```javascript
// 添加API健康检查函数
const checkAiServiceHealth = async () => {
  const services = [
    { name: 'Doubao', check: checkDoubaoHealth },
    { name: 'OpenAI', check: checkOpenAIHealth }
  ];

  for (const service of services) {
    try {
      const isHealthy = await service.check();
      if (isHealthy) {
        console.log(`${service.name} API is healthy`);
        return service.name;
      }
    } catch (error) {
      console.warn(`${service.name} API health check failed:`, error.message);
    }
  }

  console.error("All AI services are unavailable");
  return null;
};

const checkDoubaoHealth = async () => {
  // 简单的健康检查，例如调用一个简单的端点
  return true; // 简化实现
};
```

### 方案4：前端优化

#### 添加AI服务状态提示：
在`home/index.js`中添加：

```javascript
// 在applyDailyRecord函数中添加
applyDailyRecord: function (record) {
  // ... 原有代码
  
  // 添加AI服务状态提示
  if (record.ai_summary_source === 'rule') {
    console.log("AI service unavailable, using rule engine");
    // 可以在这里添加用户提示，例如：
    // wx.showToast({ title: 'AI服务暂时不可用，使用规则引擎', icon: 'none', duration: 2000 });
  }
  
  // ... 原有代码
}
```

#### 在前端显示更详细的状态：
修改`home/index.wxml`：

```xml
<view class="ai-summary-head">
  <text class="ai-badge">AI</text>
  <text class="ai-title">今日健康摘要</text>
  <text class="ai-source-tag">来源：{{aiSummarySource==='ai'?'AI':'规则'}}</text>
  <text class="ai-status-indicator {{aiSummarySource==='ai'?'ai-active':'ai-inactive'}}" wx:if="{{showAiStatus}}">
    {{aiSummarySource==='ai'?'●':'○'}}
  </text>
</view>
```

## 实施步骤

### 第一阶段：立即修复（今天）
1. **验证API端点**：检查`https://ark.cn-beijing.volces.com/api/v3`是否可访问
2. **获取有效API密钥**：联系火山引擎支持或获取新的API密钥
3. **更新配置**：修改云函数中的API配置

### 第二阶段：增强稳定性（1-2天）
1. **实现多AI服务备用**：添加OpenAI作为备用方案
2. **增强错误处理**：添加详细的错误日志和监控
3. **添加健康检查**：实现API健康检查机制

### 第三阶段：优化体验（1周）
1. **前端状态显示**：优化用户界面，显示AI服务状态
2. **性能优化**：缓存AI结果，减少API调用
3. **监控告警**：设置AI服务不可用时的告警机制

## 测试验证

### 测试步骤：
1. 更新API配置后，重新部署云函数
2. 在前端进行日常记录操作
3. 检查云函数日志，确认AI调用是否成功
4. 验证前端是否显示"来源：AI"

### 预期结果：
- 云函数日志中不再出现`doubao status 404`错误
- AI调用成功时，返回结果中的`source`字段为`"ai"`
- 前端正确显示"来源：AI"

## 总结

问题根本原因是**火山引擎API端点不可用或配置错误**。建议优先尝试方案1（更新为有效的火山引擎API），如果不可行则采用方案2（切换到OpenAI API）。

前端显示"来源：规则"是正确的，因为它准确地反映了AI调用失败后降级到规则引擎的实际情况。修复API配置后，前端将自动显示"来源：AI"。