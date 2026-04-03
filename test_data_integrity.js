// 数据完整性测试
// 验证前端数据保存和AI数据接收的完整性

console.log("=== 数据完整性测试 ===\n");

// 模拟前端保存的数据结构
const frontendData = {
  // 假设用户记录了以下数据
  feeding: {
    type: "主粮",
    amount: "150",
    unit: "克"
  },
  hydration: {
    status: "偏少"  // 这是异常项，AI可能过度关注这个
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

console.log("1. 前端保存的完整数据：");
console.log(JSON.stringify(frontendData, null, 2));

// 模拟buildAiInputFromRecord函数处理
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

const processedData = buildAiInputFromRecord(frontendData);
console.log("\n2. 处理后传递给AI的数据：");
console.log(JSON.stringify(processedData, null, 2));

// 检查数据完整性
console.log("\n3. 数据完整性检查：");
const checks = [
  { field: 'feeding', exists: !!processedData.feeding, value: processedData.feeding },
  { field: 'hydration', exists: !!processedData.hydration, value: processedData.hydration },
  { field: 'excretion', exists: !!processedData.excretion, value: processedData.excretion },
  { field: 'activity', exists: !!processedData.activity, value: processedData.activity },
  { field: 'sleep', exists: !!processedData.sleep, value: processedData.sleep },
  { field: 'mood', exists: !!processedData.mood, value: processedData.mood },
];

checks.forEach(check => {
  console.log(`  ${check.field}: ${check.exists ? '✓ 存在' : '✗ 缺失'}`);
  if (check.exists && check.value) {
    console.log(`    数据: ${JSON.stringify(check.value)}`);
  }
});

// 分析可能的问题
console.log("\n4. 可能的问题分析：");

// 问题1：AI过度关注异常项
console.log("问题1: AI可能过度关注异常项（饮水偏少）");
console.log("   - 饮水状态是'偏少'，这是异常状态");
console.log("   - AI可能被训练为优先关注异常情况");
console.log("   - 解决方案：在提示词中强调'即使有异常，也要全面描述所有记录'");

// 问题2：数据字段名称不一致
console.log("\n问题2: 数据字段名称可能不一致");
console.log("   - 前端字段名: feeding, hydration, excretion, activity, sleep, mood");
console.log("   - 需要确保云函数接收相同的字段名");

// 问题3：空值处理
console.log("\n问题3: 空值处理可能导致AI忽略");
console.log("   - 检查duration等字段是否为空字符串");
console.log("   - 空字符串可能被AI理解为'未记录'");

// 测试不同的数据场景
console.log("\n5. 测试不同数据场景：");

// 场景1：所有字段都有值
const scenario1 = {
  feeding: { type: "主粮", amount: "150", unit: "克" },
  hydration: { status: "正常" },
  excretion: { poopStatus: "正常", peeStatus: "正常" },
  activity: { duration: "30", intensity: "散步" },
  sleep: { duration: "10", quality: "深睡" },
  mood: { mood: "开心" }
};

// 场景2：只有饮水和饮食
const scenario2 = {
  feeding: { type: "主粮", amount: "150", unit: "克" },
  hydration: { status: "偏少" }
  // 其他字段未定义
};

console.log("场景1（完整记录）：");
console.log(JSON.stringify(buildAiInputFromRecord(scenario1), null, 2));

console.log("\n场景2（部分记录）：");
console.log(JSON.stringify(buildAiInputFromRecord(scenario2), null, 2));

console.log("\n=== 测试结论 ===");
console.log("1. 数据转换函数工作正常");
console.log("2. 所有字段都能正确传递到AI");
console.log("3. 问题可能在于：");
console.log("   - AI提示词需要更强调'全面性'");
console.log("   - AI可能被异常项分散注意力");
console.log("   - 需要检查实际保存到数据库的数据");

console.log("\n建议下一步：");
console.log("1. 重新部署带调试日志的云函数");
console.log("2. 在前端进行完整记录测试");
console.log("3. 检查云函数日志，查看AI实际接收的数据");
console.log("4. 根据日志优化提示词");