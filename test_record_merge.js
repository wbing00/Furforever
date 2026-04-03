<<<<<<< HEAD
// 测试记录合并功能
// 验证前端和云函数的数据合并逻辑

console.log("=== 记录合并功能测试 ===\n");

// 模拟前端保存逻辑（修复后的版本）
function simulateFrontendSave(existingRecord, newRecordType, newRecordData) {
  // 模拟前端 saveRecord 函数中的合并逻辑
  const merged = {
    ...(existingRecord || {}),
    pet_id: "test_pet_123",
    date: "2026-03-27",
    [newRecordType]: newRecordData
  };
  
  // 确保保留所有已存在的字段
  if (existingRecord) {
    Object.keys(existingRecord).forEach(key => {
      if (key !== 'pet_id' && key !== 'date' && key !== '_id' &&
          key !== 'created_at' && key !== 'updated_at' &&
          key !== 'ai_summary' && key !== 'ai_summary_source' &&
          key !== 'ai_summary_updated_at' && key !== 'alert_level' &&
          key !== 'alert_source' && key !== 'alerts' &&
          key !== 'owner_openid') {
        if (!merged[key] && existingRecord[key]) {
          merged[key] = existingRecord[key];
        }
      }
    });
  }
  
  return merged;
}

// 模拟云函数合并逻辑（修复后的版本）
function simulateCloudFunctionMerge(existingRecord, incomingData) {
  // 模拟云函数 addDailyRecord 中的合并逻辑
  const { pet_id, date, ...recordData } = incomingData;
  
  if (existingRecord) {
    // 合并数据：保留现有字段，用新数据更新或添加字段
    const mergedData = {
      ...existingRecord,  // 保留所有现有字段
      ...recordData,      // 用新数据更新/添加字段
      updated_at: new Date().toISOString(),
    };
    
    // 移除数据库系统字段，避免更新冲突
    delete mergedData._id;
    delete mergedData.created_at;
    delete mergedData.owner_openid;
    
    return mergedData;
  } else {
    // 创建新记录
    return {
      pet_id,
      date,
      owner_openid: "test_openid",
      ...recordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

// 测试场景1：模拟用户依次记录饮食、饮水、运动
console.log("测试场景1：用户依次记录饮食、饮水、运动\n");

let databaseRecord = null;

// 第一次记录：饮食
console.log("1. 用户记录饮食...");
const feedingData = { type: "主粮", amount: "150", unit: "克" };
const frontendData1 = simulateFrontendSave(databaseRecord, "feeding", feedingData);
console.log("前端发送的数据:", JSON.stringify(frontendData1, null, 2));

// 云函数处理第一次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData1);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 第二次记录：饮水
console.log("\n2. 用户记录饮水...");
const hydrationData = { status: "正常" };
const frontendData2 = simulateFrontendSave(databaseRecord, "hydration", hydrationData);
console.log("前端发送的数据:", JSON.stringify(frontendData2, null, 2));

// 云函数处理第二次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData2);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 第三次记录：运动
console.log("\n3. 用户记录运动...");
const activityData = { duration: "30", intensity: "散步" };
const frontendData3 = simulateFrontendSave(databaseRecord, "activity", activityData);
console.log("前端发送的数据:", JSON.stringify(frontendData3, null, 2));

// 云函数处理第三次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData3);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 验证结果
console.log("\n验证结果:");
const hasFeeding = databaseRecord.feeding && databaseRecord.feeding.type === "主粮";
const hasHydration = databaseRecord.hydration && databaseRecord.hydration.status === "正常";
const hasActivity = databaseRecord.activity && databaseRecord.activity.duration === "30";
const allPresent = hasFeeding && hasHydration && hasActivity;

console.log(`- 饮食记录存在: ${hasFeeding ? "✓" : "✗"}`);
console.log(`- 饮水记录存在: ${hasHydration ? "✓" : "✗"}`);
console.log(`- 运动记录存在: ${hasActivity ? "✓" : "✗"}`);
console.log(`- 所有记录都存在: ${allPresent ? "✓" : "✗"}`);

if (allPresent) {
  console.log("\n✅ 测试通过：多记录类型被正确合并保存");
} else {
  console.log("\n❌ 测试失败：某些记录类型丢失");
}

// 测试场景2：模拟AI数据读取
console.log("\n\n测试场景2：AI数据读取验证\n");

// 模拟 buildAiInputFromRecord 函数
function buildAiInputFromRecord(record) {
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
    } : null
  };
}

const aiInput = buildAiInputFromRecord(databaseRecord);
console.log("AI接收到的数据:");
console.log(JSON.stringify(aiInput, null, 2));

// 检查AI是否能读取所有记录
const aiHasFeeding = aiInput.feeding !== null;
const aiHasHydration = aiInput.hydration !== null;
const aiHasActivity = aiInput.activity !== null;

console.log("\nAI数据读取验证:");
console.log(`- AI能读取饮食数据: ${aiHasFeeding ? "✓" : "✗"}`);
console.log(`- AI能读取饮水数据: ${aiHasHydration ? "✓" : "✗"}`);
console.log(`- AI能读取运动数据: ${aiHasActivity ? "✓" : "✗"}`);

if (aiHasFeeding && aiHasHydration && aiHasActivity) {
  console.log("✅ AI能正确读取所有记录类型");
} else {
  console.log("❌ AI无法读取某些记录类型");
}

=======
// 测试记录合并功能
// 验证前端和云函数的数据合并逻辑

console.log("=== 记录合并功能测试 ===\n");

// 模拟前端保存逻辑（修复后的版本）
function simulateFrontendSave(existingRecord, newRecordType, newRecordData) {
  // 模拟前端 saveRecord 函数中的合并逻辑
  const merged = {
    ...(existingRecord || {}),
    pet_id: "test_pet_123",
    date: "2026-03-27",
    [newRecordType]: newRecordData
  };
  
  // 确保保留所有已存在的字段
  if (existingRecord) {
    Object.keys(existingRecord).forEach(key => {
      if (key !== 'pet_id' && key !== 'date' && key !== '_id' &&
          key !== 'created_at' && key !== 'updated_at' &&
          key !== 'ai_summary' && key !== 'ai_summary_source' &&
          key !== 'ai_summary_updated_at' && key !== 'alert_level' &&
          key !== 'alert_source' && key !== 'alerts' &&
          key !== 'owner_openid') {
        if (!merged[key] && existingRecord[key]) {
          merged[key] = existingRecord[key];
        }
      }
    });
  }
  
  return merged;
}

// 模拟云函数合并逻辑（修复后的版本）
function simulateCloudFunctionMerge(existingRecord, incomingData) {
  // 模拟云函数 addDailyRecord 中的合并逻辑
  const { pet_id, date, ...recordData } = incomingData;
  
  if (existingRecord) {
    // 合并数据：保留现有字段，用新数据更新或添加字段
    const mergedData = {
      ...existingRecord,  // 保留所有现有字段
      ...recordData,      // 用新数据更新/添加字段
      updated_at: new Date().toISOString(),
    };
    
    // 移除数据库系统字段，避免更新冲突
    delete mergedData._id;
    delete mergedData.created_at;
    delete mergedData.owner_openid;
    
    return mergedData;
  } else {
    // 创建新记录
    return {
      pet_id,
      date,
      owner_openid: "test_openid",
      ...recordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

// 测试场景1：模拟用户依次记录饮食、饮水、运动
console.log("测试场景1：用户依次记录饮食、饮水、运动\n");

let databaseRecord = null;

// 第一次记录：饮食
console.log("1. 用户记录饮食...");
const feedingData = { type: "主粮", amount: "150", unit: "克" };
const frontendData1 = simulateFrontendSave(databaseRecord, "feeding", feedingData);
console.log("前端发送的数据:", JSON.stringify(frontendData1, null, 2));

// 云函数处理第一次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData1);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 第二次记录：饮水
console.log("\n2. 用户记录饮水...");
const hydrationData = { status: "正常" };
const frontendData2 = simulateFrontendSave(databaseRecord, "hydration", hydrationData);
console.log("前端发送的数据:", JSON.stringify(frontendData2, null, 2));

// 云函数处理第二次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData2);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 第三次记录：运动
console.log("\n3. 用户记录运动...");
const activityData = { duration: "30", intensity: "散步" };
const frontendData3 = simulateFrontendSave(databaseRecord, "activity", activityData);
console.log("前端发送的数据:", JSON.stringify(frontendData3, null, 2));

// 云函数处理第三次记录
databaseRecord = simulateCloudFunctionMerge(databaseRecord, frontendData3);
console.log("数据库记录:", JSON.stringify(databaseRecord, null, 2));

// 验证结果
console.log("\n验证结果:");
const hasFeeding = databaseRecord.feeding && databaseRecord.feeding.type === "主粮";
const hasHydration = databaseRecord.hydration && databaseRecord.hydration.status === "正常";
const hasActivity = databaseRecord.activity && databaseRecord.activity.duration === "30";
const allPresent = hasFeeding && hasHydration && hasActivity;

console.log(`- 饮食记录存在: ${hasFeeding ? "✓" : "✗"}`);
console.log(`- 饮水记录存在: ${hasHydration ? "✓" : "✗"}`);
console.log(`- 运动记录存在: ${hasActivity ? "✓" : "✗"}`);
console.log(`- 所有记录都存在: ${allPresent ? "✓" : "✗"}`);

if (allPresent) {
  console.log("\n✅ 测试通过：多记录类型被正确合并保存");
} else {
  console.log("\n❌ 测试失败：某些记录类型丢失");
}

// 测试场景2：模拟AI数据读取
console.log("\n\n测试场景2：AI数据读取验证\n");

// 模拟 buildAiInputFromRecord 函数
function buildAiInputFromRecord(record) {
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
    } : null
  };
}

const aiInput = buildAiInputFromRecord(databaseRecord);
console.log("AI接收到的数据:");
console.log(JSON.stringify(aiInput, null, 2));

// 检查AI是否能读取所有记录
const aiHasFeeding = aiInput.feeding !== null;
const aiHasHydration = aiInput.hydration !== null;
const aiHasActivity = aiInput.activity !== null;

console.log("\nAI数据读取验证:");
console.log(`- AI能读取饮食数据: ${aiHasFeeding ? "✓" : "✗"}`);
console.log(`- AI能读取饮水数据: ${aiHasHydration ? "✓" : "✗"}`);
console.log(`- AI能读取运动数据: ${aiHasActivity ? "✓" : "✗"}`);

if (aiHasFeeding && aiHasHydration && aiHasActivity) {
  console.log("✅ AI能正确读取所有记录类型");
} else {
  console.log("❌ AI无法读取某些记录类型");
}

>>>>>>> origin/main
console.log("\n=== 测试完成 ===");