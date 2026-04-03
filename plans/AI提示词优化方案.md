# AI提示词优化方案

## 问题诊断
AI生成的健康摘要只关注饮水问题，忽略了其他已记录的项目。测试表明数据传递正常，问题在于AI提示词。

## 根本原因分析
1. **AI的注意力偏差**：大语言模型倾向于关注异常或负面信息
2. **提示词约束力不足**：现有的"必须涵盖"要求可能不够强制
3. **输出格式限制**：80-150字可能限制了AI表达所有信息

## 优化方案

### 方案1：结构化强制要求（推荐）

#### 优化后的提示词模板：
```
你是一个专业的宠物健康记录助手。请根据以下宠物日常记录生成全面的健康摘要。

【记录数据】
${JSON.stringify(promptData, null, 2)}

【分析要求】
你必须按照以下结构生成摘要：
1. 饮食情况：${promptData.feeding ? `今天吃了${promptData.feeding.amount}${promptData.feeding.unit}的${promptData.feeding.type}` : '未记录饮食'}
2. 饮水状态：${promptData.hydration ? `饮水${promptData.hydration.status}` : '未记录饮水'}
3. 排泄情况：${promptData.excretion ? `便便${promptData.excretion.poopStatus}，尿尿${promptData.excretion.peeStatus}` : '未记录排泄'}
4. 活动情况：${promptData.activity ? `活动了${promptData.activity.duration}分钟，强度${promptData.activity.intensity}` : '未记录活动'}
5. 睡眠情况：${promptData.sleep ? `睡了${promptData.sleep.duration}小时，质量${promptData.sleep.quality}` : '未记录睡眠'}
6. 情绪状态：${promptData.mood ? `情绪${promptData.mood.mood}` : '未记录情绪'}

【强制要求】
1. 必须涵盖以上6个方面中所有已记录的项目
2. 即使有异常情况（如饮水偏少），也要平等对待所有记录
3. 摘要应该自然连贯，将这些方面串联成一个完整的描述
4. 不要使用"未记录"这样的表述，只描述已记录的内容

【输出格式】
{
  "summary": "将以上6个方面串联成一个80-150字的自然段落，描述宠物一天的整体状况",
  "alerts": ["仅当有异常情况时才添加提醒，如'饮水偏少，建议注意补水'"],
  "alertLevel": "normal或warning"
}
```

### 方案2：示例引导法

#### 提供示例输出：
```
【示例输入】
{
  "feeding": {"type": "主粮", "amount": "150", "unit": "克"},
  "hydration": {"status": "偏少"},
  "excretion": {"poopStatus": "正常", "peeStatus": "正常"},
  "activity": {"duration": "30", "intensity": "散步"},
  "sleep": {"duration": "10", "quality": "深睡"},
  "mood": {"mood": "开心"}
}

【示例输出】
{
  "summary": "今天宠物吃了150克主粮，饮食正常。饮水方面稍显偏少，需要注意补水。排泄情况良好，便便和尿尿都正常。下午散步30分钟，活动量适中。晚上睡了10个小时，睡眠质量很好，属于深睡状态。整体情绪开心，精神状态不错。",
  "alerts": ["今日饮水偏少，建议注意补水"],
  "alertLevel": "warning"
}
```

### 方案3：分步思考法

#### 强制AI分步思考：
```
请按照以下步骤思考：
1. 首先，列出所有已记录的项目
2. 然后，为每个已记录的项目生成一句话描述
3. 接着，将这些描述串联成一个连贯的段落
4. 最后，检查是否有异常需要提醒

步骤1结果：已记录饮食、饮水、排泄、活动、睡眠、情绪
步骤2结果：
- 饮食：吃了150克主粮
- 饮水：饮水偏少
- 排泄：便便正常，尿尿正常
- 活动：散步30分钟
- 睡眠：深睡10小时
- 情绪：开心
步骤3结果：（生成连贯摘要）
步骤4结果：饮水偏少需要提醒
```

## 实施步骤

### 1. 立即实施（方案1）
修改`generateAiSummaryByDoubao`函数中的提示词，使用结构化强制要求。

### 2. 代码修改
```javascript
const detailedPrompt = `你是一个专业的宠物健康记录助手。请根据以下宠物日常记录生成全面的健康摘要。

【记录数据】
${JSON.stringify(promptData, null, 2)}

【分析要求】
你必须按照以下结构思考：
1. 饮食情况：${promptData.feeding ? `今天吃了${promptData.feeding.amount}${promptData.feeding.unit}的${promptData.feeding.type}` : '未记录'}
2. 饮水状态：${promptData.hydration ? `饮水${promptData.hydration.status}` : '未记录'}
3. 排泄情况：${promptData.excretion ? `便便${promptData.excretion.poopStatus}，尿尿${promptData.excretion.peeStatus}` : '未记录'}
4. 活动情况：${promptData.activity ? `活动了${promptData.activity.duration}分钟，强度${promptData.activity.intensity}` : '未记录'}
5. 睡眠情况：${promptData.sleep ? `睡了${promptData.sleep.duration}小时，质量${promptData.sleep.quality}` : '未记录'}
6. 情绪状态：${promptData.mood ? `情绪${promptData.mood.mood}` : '未记录'}

【强制要求】
1. 必须涵盖以上6个方面中所有已记录的项目，一个都不能少
2. 即使有异常情况，也要平等对待所有记录，不要只关注异常
3. 摘要应该自然连贯，将这些方面串联成一个完整的描述
4. 不要使用"未记录"或"其他方面未记录"这样的表述

【输出格式】
{
  "summary": "将以上6个方面串联成一个80-150字的自然段落",
  "alerts": ["仅当有异常情况时才添加提醒"],
  "alertLevel": "normal或warning"
}`;
```

### 3. 系统角色强化
```javascript
{
  role: "system",
  content: "你是一个严谨的宠物健康记录助手。你的任务是生成全面、平衡的健康摘要。你必须确保涵盖所有已记录的项目，不能遗漏任何一项。即使有异常情况，你也要平等对待所有记录。你的摘要应该温暖但专业。"
}
```

## 测试验证

### 测试用例1：完整记录
```javascript
const testRecord = {
  feeding: { type: "主粮", amount: "150", unit: "克" },
  hydration: { status: "偏少" },
  excretion: { poopStatus: "正常", peeStatus: "正常" },
  activity: { duration: "30", intensity: "散步" },
  sleep: { duration: "10", quality: "深睡" },
  mood: { mood: "开心" }
};
```

### 预期输出：
- 摘要必须包含：饮食、饮水、排泄、活动、睡眠、情绪
- 可以提及饮水偏少，但不能只关注这一点
- 应该是连贯的段落，不是列表

### 测试用例2：部分记录
```javascript
const testRecord = {
  feeding: { type: "罐头", amount: "1", unit: "个" },
  hydration: { status: "正常" }
  // 其他字段未记录
};
```

### 预期输出：
- 摘要只包含饮食和饮水
- 不提及"其他方面未记录"
- 自然描述已记录的内容

## 部署计划

### 阶段1：立即部署
1. 更新云函数中的提示词为方案1
2. 重新部署云函数
3. 进行前端测试

### 阶段2：监控优化
1. 检查云函数日志，查看AI实际响应
2. 根据实际效果微调提示词
3. 如果效果不佳，尝试方案2（示例引导）

### 阶段3：长期优化
1. 收集用户反馈
2. A/B测试不同的提示词版本
3. 建立提示词优化流程

## 风险控制

### 风险1：AI仍然忽略某些字段
- 应对：进一步强化"必须涵盖"的要求
- 应对：使用更具体的字段描述

### 风险2：摘要不自然
- 应对：调整提示词平衡"全面性"和"自然性"
- 应对：提供更多示例

### 风险3：token限制
- 应对：适当增加max_tokens到500
- 应对：优化提示词结构，减少冗余

## 总结
通过结构化强制要求和强化系统角色，可以显著改善AI摘要的全面性。关键是要明确告诉AI："必须涵盖所有已记录的项目，不能只关注异常"。