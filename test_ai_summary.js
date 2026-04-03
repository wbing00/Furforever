// AI摘要生成测试脚本
// 模拟一个完整的日常记录，测试AI是否能生成全面的摘要

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

// 构建测试提示词
const promptData = buildAiInputFromRecord(testRecord);

const detailedPrompt = `请根据以下宠物日常记录生成全面的健康摘要：

记录数据详情：
${JSON.stringify(promptData, null, 2)}

请仔细分析以下所有方面：
1. 饮食情况：${promptData.feeding ? `类型：${promptData.feeding.type}，分量：${promptData.feeding.amount}${promptData.feeding.unit}` : '未记录'}
2. 饮水状态：${promptData.hydration ? promptData.hydration.status : '未记录'}
3. 排泄情况：${promptData.excretion ? `便便：${promptData.excretion.poopStatus}，尿尿：${promptData.excretion.peeStatus}` : '未记录'}
4. 活动情况：${promptData.activity ? `时长：${promptData.activity.duration}分钟，强度：${promptData.activity.intensity}` : '未记录'}
5. 睡眠情况：${promptData.sleep ? `时长：${promptData.sleep.duration}小时，质量：${promptData.sleep.quality}` : '未记录'}
6. 情绪状态：${promptData.mood ? promptData.mood.mood : '未记录'}

生成要求：
1. 摘要应涵盖所有已记录的项目，不要遗漏任何已记录的信息。
2. 如果某项未记录，在摘要中不要提及"未记录"，而是专注于已记录的项目
3. 摘要应自然流畅，像宠物主人的朋友在描述宠物的一天
4. 如果发现异常情况（如饮水偏少、便便异常等），在alerts中提醒
5. 整体评估宠物当日的健康状况

输出JSON格式：{"summary":"80-150字的全面健康摘要","alerts":["异常提醒字符串数组"],"alertLevel":"normal或warning"}`;

console.log("=== AI摘要生成测试 ===");
console.log("\n1. 测试记录数据：");
console.log(JSON.stringify(testRecord, null, 2));

console.log("\n2. 处理后数据：");
console.log(JSON.stringify(promptData, null, 2));

console.log("\n3. 生成的提示词（前500字符）：");
console.log(detailedPrompt.substring(0, 500) + "...");

console.log("\n4. 预期结果：");
console.log("摘要应包含：饮食（主粮150克）、饮水（偏少）、排泄（正常）、活动（散步30分钟）、睡眠（深睡10小时）、情绪（开心）");
console.log("提醒应包含：饮水偏少的提醒");
console.log("不应出现：'其他方面未记录'这样的表述");

console.log("\n=== 测试完成 ===");
console.log("\n部署云函数后，请进行实际测试：");
console.log("1. 在微信开发者工具中重新部署云函数");
console.log("2. 在前端进行完整的日常记录（饮食、饮水、排泄、活动、睡眠、情绪）");
console.log("3. 检查AI生成的摘要是否全面覆盖所有记录字段");
console.log("4. 验证前端显示'来源：AI'且摘要内容正确");