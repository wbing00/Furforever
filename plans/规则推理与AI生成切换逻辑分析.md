# 规则推理与AI生成切换逻辑分析

## 概述
本项目中的"今日健康摘要"和"异常关注提醒"有两种生成方式：
1. **规则推理**：基于预设规则生成的摘要和提醒
2. **AI生成**：通过Doubao API调用大语言模型生成的智能摘要

## 切换逻辑分析

### 1. 健康摘要来源 (`aiSummarySource`)
**前端显示位置**：`<text class="ai-source-tag">来源：{{aiSummarySource==='ai'?'AI':'规则'}}</text>`

**决定逻辑**（位于 `cloudfunctions/petFunctions/index.js` 的 `generateDailyInsights` 函数）：

```javascript
let summarySource = "rule";  // 默认值
let aiSucceeded = false;

try {
  const aiResult = await generateAiSummaryByDoubao(currentRecord);
  summary = aiResult.summary || summary;
  aiAlerts = aiResult.alerts || [];
  aiAlertLevel = aiResult.alertLevel || "normal";
  summarySource = "ai";  // AI调用成功时设置为"ai"
  aiSucceeded = true;
} catch (aiErr) {
  console.warn("generateAiSummaryByDoubao fallback to rule:", aiErr.message);
  summarySource = "rule";  // AI调用失败时回退到规则
}
```

**切换条件**：
- **AI生成**：当 `generateAiSummaryByDoubao` 函数成功执行且不抛出异常时
- **规则推理**：当以下任一情况发生时：
  1. AI API调用失败（网络错误、API密钥无效、超时等）
  2. AI返回的数据解析失败
  3. 当前没有记录数据（`!currentRecord`）

### 2. 异常提醒来源 (`alertSource`)
**前端显示位置**：`<text class="ai-source-tag">来源：{{alertSource==='ai'?'AI':(alertSource==='ai+rule'?'AI+规则':'规则')}}</text>`

**决定逻辑**：
```javascript
const alertSource = aiSucceeded ? (ruleAlerts.length > 0 ? "ai+rule" : "ai") : "rule";
```

**切换条件**：
- **AI**：AI调用成功且规则提醒为空
- **AI+规则**：AI调用成功且规则提醒不为空
- **规则**：AI调用失败

### 3. 规则提醒生成逻辑
规则提醒基于简单的预设规则：
```javascript
const ruleAlerts = [];
const hydrationLowTwoDays = !!(day1 && day2 && day1.hydration && day2.hydration && 
                              day1.hydration.status === "偏少" && day2.hydration.status === "偏少");
const poopAbnormalTwoDays = !!(day1 && day2 && day1.excretion && day2.excretion && 
                              day1.excretion.poopStatus && day2.excretion.poopStatus && 
                              day1.excretion.poopStatus !== "正常" && day2.excretion.poopStatus !== "正常");

if (hydrationLowTwoDays) ruleAlerts.push("连续2天饮水偏少，建议关注补水情况。");
if (poopAbnormalTwoDays) ruleAlerts.push("连续2天便便异常，建议重点观察并必要时就医。");
```

## 具体场景分析

### 场景1：无记录数据
- **条件**：`currentRecord` 为 `null` 或 `undefined`
- **结果**：
  - 摘要："今日记录较少，继续记录可获得更完整健康摘要。"
  - 来源：规则
  - 提醒：无

### 场景2：有记录但AI调用失败
- **条件**：有记录数据，但 `generateAiSummaryByDoubao` 抛出异常
- **常见原因**：
  1. API密钥无效或过期
  2. 网络连接问题
  3. API服务不可用
  4. 响应超时（默认12秒）
- **结果**：
  - 摘要：`buildDailySummaryText(currentRecord)` 生成的规则摘要
  - 来源：规则
  - 提醒：基于规则生成的提醒（如果有）

### 场景3：AI调用成功
- **条件**：`generateAiSummaryByDoubao` 成功执行并返回有效结果
- **结果**：
  - 摘要：AI生成的智能摘要
  - 来源：AI
  - 提醒：AI提醒 + 规则提醒（合并去重）

### 场景4：AI返回数据解析失败
- **条件**：AI API调用成功但返回的数据无法解析为有效的JSON
- **结果**：回退到规则推理

## 前端数据流

1. **页面加载时**：调用 `loadDateRecord` → 调用云函数 `getDailyRecord`
2. **获取记录后**：`applyDailyRecord` 设置前端数据：
   ```javascript
   aiDailySummary: record.ai_summary || this.buildDailySummaryText(record),
   aiSummarySource: record.ai_summary_source || 'rule',
   alertSource: record.alert_source || 'rule',
   ```
3. **用户保存记录时**：触发 `generateDailyInsights` 云函数重新生成摘要

## 调试建议

如果发现"有时候仍然是规则推理"，可以检查以下方面：

### 1. 查看云函数日志
```bash
# 检查AI调用是否失败
grep "generateAiSummaryByDoubao fallback to rule" 日志文件
```

### 2. 常见失败原因
- **API配置问题**：`DOUBAO_API_URL` 或 `DOUBAO_API_KEY` 无效
- **网络问题**：防火墙阻止访问火山引擎API
- **额度限制**：API调用次数或额度用尽
- **响应格式**：AI返回的数据不符合预期格式

### 3. 测试AI连接
使用测试脚本验证API连通性：
```bash
node test_ai_summary.js
```

## 设计意图

这种"AI优先，规则兜底"的设计有以下优点：
1. **用户体验**：尽可能提供更智能的AI摘要
2. **可靠性**：AI失败时自动回退到规则，保证功能可用
3. **渐进增强**：随着AI服务稳定性的提高，AI生成的比例会自然增加

## 结论

项目中"规则推理"和"AI生成"的切换是**设计行为**而非bug。当AI服务不可用或返回异常时，系统会自动回退到规则推理，确保用户始终能看到健康摘要。这种设计提高了系统的鲁棒性和用户体验。

如果希望提高AI生成的比例，需要：
1. 确保API配置正确且有效
2. 优化网络连接
3. 监控AI服务可用性
4. 考虑增加重试机制