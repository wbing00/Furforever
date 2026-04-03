<<<<<<< HEAD
// 优化后提示词测试
console.log("=== 优化后AI提示词测试 ===\n");

// 测试数据
const testRecord = {
  feeding: {
    type: "主粮",
    amount: "150",
    unit: "克"
  },
  hydration: {
    status: "偏少"
  },
  excretion: {
    poopStatus: "正常",
    peeStatus: "正常"
  },
  activity: {
    duration: "30",
    intensity: "散步"
  },
  sleep: {
    duration: "10",
    quality: "深睡"
  },
  mood: {
    mood: "开心"
  }
};

// 模拟buildAiInputFromRecord函数
const buildAiInputFromRecord = (record) => {
  return {
    feeding: record.feeding ? {
      type: record.feeding.type || '未记录',
      amount: record.feeding.amount || '',
      unit: record.feeding.unit || '克'
    } : null,
    hydration: record.hydration ? {
      status: record.hydration.status || '未记录'
    } : null,
    excretion: record.excretion ? {
      poopStatus: record.excretion.poopStatus || '未记录',
      peeStatus: record.excretion.peeStatus || '未记录'
    } : null,
    activity: record.activity ? {
      duration: record.activity.duration || '',
      intensity: record.activity.intensity || '未记录'
    } : null,
    sleep: record.sleep ? {
      duration: record.sleep.duration || '',
      quality: record.sleep.quality || '未记录'
    } : null,
    mood: record.mood ? {
      mood: record.mood.mood || '未记录'
    } : null,
  };
};

const promptData = buildAiInputFromRecord(testRecord);

// 优化后的提示词
const optimizedPrompt = `你是一个专业的宠物健康记录助手。请根据以下宠物日常记录生成全面的健康摘要。

【记录数据】
${JSON.stringify(promptData, null, 2)}

【分析要求】
你必须按照以下结构思考所有已记录的项目：
1. 饮食情况：${promptData.feeding ? `今天吃了${promptData.feeding.amount}${promptData.feeding.unit}的${promptData.feeding.type}` : '未记录'}
2. 饮水状态：${promptData.hydration ? `饮水${promptData.hydration.status}` : '未记录'}
3. 排泄情况：${promptData.excretion ? `便便${promptData.excretion.poopStatus}，尿尿${promptData.excretion.peeStatus}` : '未记录'}
4. 活动情况：${promptData.activity ? `活动了${promptData.activity.duration}分钟，强度${promptData.activity.intensity}` : '未记录'}
5. 睡眠情况：${promptData.sleep ? `睡了${promptData.sleep.duration}小时，质量${promptData.sleep.quality}` : '未记录'}
6. 情绪状态：${promptData.mood ? `情绪${promptData.mood.mood}` : '未记录'}

【强制要求】
1. 必须涵盖以上6个方面中所有已记录的项目，一个都不能少
2. 即使有异常情况（如饮水偏少），也要平等对待所有记录，不要只关注异常
3. 摘要应该自然连贯，将这些方面串联成一个完整的描述
4. 不要使用"未记录"或"其他方面未记录"这样的表述，只描述已记录的内容
5. 确保摘要读起来像宠物主人的朋友在描述宠物的一天

【输出格式】
{
  "summary": "将以上6个方面中已记录的项目串联成一个80-150字的自然段落",
  "alerts": ["仅当有异常情况时才添加提醒，如'饮水偏少，建议注意补水'"],
  "alertLevel": "normal或warning"
}`;

console.log("1. 测试数据：");
console.log(JSON.stringify(testRecord, null, 2));

console.log("\n2. 处理后数据：");
console.log(JSON.stringify(promptData, null, 2));

console.log("\n3. 优化后提示词长度：", optimizedPrompt.length, "字符");

console.log("\n4. 提示词关键部分：");
console.log("=".repeat(50));
const lines = optimizedPrompt.split('\n');
lines.forEach((line, index) => {
  if (line.includes('必须涵盖') || line.includes('强制要求') || line.includes('即使有异常')) {
    console.log(`行 ${index + 1}: ${line}`);
  }
});
console.log("=".repeat(50));

console.log("\n5. 预期AI行为分析：");
console.log("✓ 必须涵盖所有6个方面");
console.log("✓ 不能只关注饮水偏少异常");
console.log("✓ 应该生成包含以下内容的摘要：");
console.log("   - 饮食：吃了150克主粮");
console.log("   - 饮水：饮水偏少（但不过度强调）");
console.log("   - 排泄：便便正常，尿尿正常");
console.log("   - 活动：散步30分钟");
console.log("   - 睡眠：深睡10小时");
console.log("   - 情绪：开心");

console.log("\n6. 预期输出示例：");
const expectedOutput = {
  summary: "今天宠物吃了150克主粮，饮食正常。饮水方面稍显偏少，需要注意补水。排泄情况良好，便便和尿尿都正常。下午散步30分钟，活动量适中。晚上睡了10个小时，睡眠质量很好，属于深睡状态。整体情绪开心，精神状态不错。",
  alerts: ["今日饮水偏少，建议注意补水"],
  alertLevel: "warning"
};
console.log(JSON.stringify(expectedOutput, null, 2));

console.log("\n7. 验证要点：");
console.log("a) 摘要是否包含所有6个方面？");
console.log("b) 是否过度强调饮水偏少？");
console.log("c) 是否出现'其他方面未记录'？");
console.log("d) 是否自然连贯？");

console.log("\n=== 测试完成 ===");
console.log("\n部署建议：");
console.log("1. 重新部署云函数");
console.log("2. 在前端进行完整记录测试");
console.log("3. 检查云函数日志中的调试信息");
=======
// 优化后提示词测试
console.log("=== 优化后AI提示词测试 ===\n");

// 测试数据
const testRecord = {
  feeding: {
    type: "主粮",
    amount: "150",
    unit: "克"
  },
  hydration: {
    status: "偏少"
  },
  excretion: {
    poopStatus: "正常",
    peeStatus: "正常"
  },
  activity: {
    duration: "30",
    intensity: "散步"
  },
  sleep: {
    duration: "10",
    quality: "深睡"
  },
  mood: {
    mood: "开心"
  }
};

// 模拟buildAiInputFromRecord函数
const buildAiInputFromRecord = (record) => {
  return {
    feeding: record.feeding ? {
      type: record.feeding.type || '未记录',
      amount: record.feeding.amount || '',
      unit: record.feeding.unit || '克'
    } : null,
    hydration: record.hydration ? {
      status: record.hydration.status || '未记录'
    } : null,
    excretion: record.excretion ? {
      poopStatus: record.excretion.poopStatus || '未记录',
      peeStatus: record.excretion.peeStatus || '未记录'
    } : null,
    activity: record.activity ? {
      duration: record.activity.duration || '',
      intensity: record.activity.intensity || '未记录'
    } : null,
    sleep: record.sleep ? {
      duration: record.sleep.duration || '',
      quality: record.sleep.quality || '未记录'
    } : null,
    mood: record.mood ? {
      mood: record.mood.mood || '未记录'
    } : null,
  };
};

const promptData = buildAiInputFromRecord(testRecord);

// 优化后的提示词
const optimizedPrompt = `你是一个专业的宠物健康记录助手。请根据以下宠物日常记录生成全面的健康摘要。

【记录数据】
${JSON.stringify(promptData, null, 2)}

【分析要求】
你必须按照以下结构思考所有已记录的项目：
1. 饮食情况：${promptData.feeding ? `今天吃了${promptData.feeding.amount}${promptData.feeding.unit}的${promptData.feeding.type}` : '未记录'}
2. 饮水状态：${promptData.hydration ? `饮水${promptData.hydration.status}` : '未记录'}
3. 排泄情况：${promptData.excretion ? `便便${promptData.excretion.poopStatus}，尿尿${promptData.excretion.peeStatus}` : '未记录'}
4. 活动情况：${promptData.activity ? `活动了${promptData.activity.duration}分钟，强度${promptData.activity.intensity}` : '未记录'}
5. 睡眠情况：${promptData.sleep ? `睡了${promptData.sleep.duration}小时，质量${promptData.sleep.quality}` : '未记录'}
6. 情绪状态：${promptData.mood ? `情绪${promptData.mood.mood}` : '未记录'}

【强制要求】
1. 必须涵盖以上6个方面中所有已记录的项目，一个都不能少
2. 即使有异常情况（如饮水偏少），也要平等对待所有记录，不要只关注异常
3. 摘要应该自然连贯，将这些方面串联成一个完整的描述
4. 不要使用"未记录"或"其他方面未记录"这样的表述，只描述已记录的内容
5. 确保摘要读起来像宠物主人的朋友在描述宠物的一天

【输出格式】
{
  "summary": "将以上6个方面中已记录的项目串联成一个80-150字的自然段落",
  "alerts": ["仅当有异常情况时才添加提醒，如'饮水偏少，建议注意补水'"],
  "alertLevel": "normal或warning"
}`;

console.log("1. 测试数据：");
console.log(JSON.stringify(testRecord, null, 2));

console.log("\n2. 处理后数据：");
console.log(JSON.stringify(promptData, null, 2));

console.log("\n3. 优化后提示词长度：", optimizedPrompt.length, "字符");

console.log("\n4. 提示词关键部分：");
console.log("=".repeat(50));
const lines = optimizedPrompt.split('\n');
lines.forEach((line, index) => {
  if (line.includes('必须涵盖') || line.includes('强制要求') || line.includes('即使有异常')) {
    console.log(`行 ${index + 1}: ${line}`);
  }
});
console.log("=".repeat(50));

console.log("\n5. 预期AI行为分析：");
console.log("✓ 必须涵盖所有6个方面");
console.log("✓ 不能只关注饮水偏少异常");
console.log("✓ 应该生成包含以下内容的摘要：");
console.log("   - 饮食：吃了150克主粮");
console.log("   - 饮水：饮水偏少（但不过度强调）");
console.log("   - 排泄：便便正常，尿尿正常");
console.log("   - 活动：散步30分钟");
console.log("   - 睡眠：深睡10小时");
console.log("   - 情绪：开心");

console.log("\n6. 预期输出示例：");
const expectedOutput = {
  summary: "今天宠物吃了150克主粮，饮食正常。饮水方面稍显偏少，需要注意补水。排泄情况良好，便便和尿尿都正常。下午散步30分钟，活动量适中。晚上睡了10个小时，睡眠质量很好，属于深睡状态。整体情绪开心，精神状态不错。",
  alerts: ["今日饮水偏少，建议注意补水"],
  alertLevel: "warning"
};
console.log(JSON.stringify(expectedOutput, null, 2));

console.log("\n7. 验证要点：");
console.log("a) 摘要是否包含所有6个方面？");
console.log("b) 是否过度强调饮水偏少？");
console.log("c) 是否出现'其他方面未记录'？");
console.log("d) 是否自然连贯？");

console.log("\n=== 测试完成 ===");
console.log("\n部署建议：");
console.log("1. 重新部署云函数");
console.log("2. 在前端进行完整记录测试");
console.log("3. 检查云函数日志中的调试信息");
>>>>>>> origin/main
console.log("4. 验证AI实际生成的摘要是否符合预期");