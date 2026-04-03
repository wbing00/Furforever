const https = require("https");
const { cloud, db } = require("./runtime");
const {
  DEFAULT_SUMMARY,
  DOUBAO_API_URL,
  DOUBAO_API_KEY,
  DOUBAO_MODEL,
} = require("./config");
const {
  formatDate,
  normalizeText,
  sanitizeAlerts,
  mergeUniqueAlerts,
  safeParseJsonFromText,
} = require("./utils");

const CONFIDENCE_LEVELS = ["high", "medium", "low"];

const buildDailySummaryText = (record) => {
  const parts = [];

  if (record.feeding) {
    const type = normalizeText(record.feeding.type, "");
    const amount = normalizeText(record.feeding.amount, "");
    const unit = normalizeText(record.feeding.unit, "");

    if (type || amount) {
      parts.push(`饮食方面记录了${amount || ""}${unit || ""}${type || "食物"}`.trim());
    } else {
      parts.push("已记录饮食情况");
    }
  }

  if (record.hydration) {
    parts.push(`饮水状态为${normalizeText(record.hydration.status)}`);
  }

  if (record.excretion) {
    const exParts = [];
    const poopStatus = normalizeText(record.excretion.poopStatus);
    const peeStatus = normalizeText(record.excretion.peeStatus);

    if (poopStatus !== "未记录") exParts.push(`便便${poopStatus}`);
    if (peeStatus !== "未记录") exParts.push(`尿尿${peeStatus}`);

    if (exParts.length > 0) parts.push(`排泄情况${exParts.join("，")}`);
  }

  if (record.activity) {
    const duration = normalizeText(record.activity.duration, "");
    const intensity = normalizeText(record.activity.intensity, "");
    if (duration || intensity) {
      parts.push(`活动${duration ? `${duration}分钟` : ""}${intensity ? `，强度${intensity}` : ""}`);
    } else {
      parts.push("已记录活动情况");
    }
  }

  if (record.sleep) {
    const duration = normalizeText(record.sleep.duration, "");
    const quality = normalizeText(record.sleep.quality, "");
    if (duration || quality) {
      parts.push(`睡眠${duration ? `${duration}小时` : ""}${quality ? `，质量${quality}` : ""}`);
    } else {
      parts.push("已记录睡眠情况");
    }
  }

  if (record.mood) {
    parts.push(`情绪表现${normalizeText(record.mood.mood, "稳定")}`);
  }

  if (parts.length === 0) return DEFAULT_SUMMARY;
  return `今日健康摘要：${parts.join("；")}。`;
};

const callDoubaoApi = (payload, timeoutMs = 20000) =>
  new Promise((resolve, reject) => {
    const urlObj = new URL(DOUBAO_API_URL);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: `${urlObj.pathname}${urlObj.search || ""}`,
        method: "POST",
        protocol: urlObj.protocol,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DOUBAO_API_KEY}`,
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`doubao status ${res.statusCode}: ${raw}`));
            return;
          }

          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(new Error(`doubao parse fail: ${e.message}`));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy(new Error("doubao request timeout"));
    });
    req.write(JSON.stringify(payload));
    req.end();
  });

const parseNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const average = (nums) => {
  const list = nums.filter((n) => Number.isFinite(n));
  if (list.length === 0) return null;
  return Number((list.reduce((sum, n) => sum + n, 0) / list.length).toFixed(1));
};

const buildAiInputFromRecord = (record) => ({
  feeding: record.feeding
    ? {
        type: normalizeText(record.feeding.type),
        amount: normalizeText(record.feeding.amount, ""),
        unit: normalizeText(record.feeding.unit, "克"),
      }
    : null,
  hydration: record.hydration
    ? {
        status: normalizeText(record.hydration.status),
      }
    : null,
  excretion: record.excretion
    ? {
        poopStatus: normalizeText(record.excretion.poopStatus),
        peeStatus: normalizeText(record.excretion.peeStatus),
      }
    : null,
  activity: record.activity
    ? {
        duration: normalizeText(record.activity.duration, ""),
        intensity: normalizeText(record.activity.intensity),
      }
    : null,
  sleep: record.sleep
    ? {
        duration: normalizeText(record.sleep.duration, ""),
        quality: normalizeText(record.sleep.quality),
      }
    : null,
  mood: record.mood
    ? {
        mood: normalizeText(record.mood.mood),
      }
    : null,
  vaccine: record.vaccine || null,
  deworming: record.deworming || null,
  grooming: record.grooming || null,
  medical: record.medical || null,
});

const buildPetProfile = (pet) => {
  if (!pet) return null;
  return {
    name: normalizeText(pet.name, "宠物"),
    type: normalizeText(pet.type, "未知"),
    breed: normalizeText(pet.breed, "未知"),
    weightKg: parseNumber(pet.weight),
    birthday: normalizeText(pet.birthday, ""),
    gender: normalizeText(pet.gender, ""),
  };
};

const buildTrendContext = (records, date) => {
  const hydrationLowDays = records.filter(
    (r) => r && r.hydration && r.hydration.status === "偏少"
  ).length;
  const poopAbnormalDays = records.filter(
    (r) => r && r.excretion && r.excretion.poopStatus && r.excretion.poopStatus !== "正常"
  ).length;

  const activityMinutes = records
    .map((r) => (r && r.activity ? parseNumber(r.activity.duration) : null))
    .filter((v) => v !== null);

  const sleepHours = records
    .map((r) => (r && r.sleep ? parseNumber(r.sleep.duration) : null))
    .filter((v) => v !== null);

  const medicalAttentionDays = records.filter(
    (r) =>
      r &&
      r.medical &&
      ["观察中", "需复诊", "用药中"].includes(normalizeText(r.medical.status, ""))
  ).length;

  const riskDays = records.filter((r) => {
    if (!r) return false;
    const hydrationRisk = r.hydration && r.hydration.status === "偏少";
    const poopRisk = r.excretion && r.excretion.poopStatus && r.excretion.poopStatus !== "正常";
    const vaccineRisk =
      r.vaccine && ["待接种", "已超期"].includes(normalizeText(r.vaccine.status, ""));
    const dewormingRisk =
      r.deworming && ["待驱虫", "已超期"].includes(normalizeText(r.deworming.status, ""));
    const medicalRisk =
      r.medical && ["观察中", "需复诊", "用药中"].includes(normalizeText(r.medical.status, ""));
    return hydrationRisk || poopRisk || vaccineRisk || dewormingRisk || medicalRisk;
  }).length;

  return {
    targetDate: date,
    daysCovered: records.length,
    hydrationLowDays,
    poopAbnormalDays,
    activityAvgMinutes: average(activityMinutes),
    sleepAvgHours: average(sleepHours),
    medicalAttentionDays,
    riskDays,
  };
};

const sanitizeStringList = (value, limit = 3) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, limit);
};

const sanitizeHighlights = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const title = normalizeText(item.title, "");
      const reason = normalizeText(item.reason, "");
      const confidence = CONFIDENCE_LEVELS.includes(item.confidence) ? item.confidence : "medium";
      if (!title && !reason) return null;
      return {
        title: title || "健康关注",
        reason: reason || title,
        confidence,
      };
    })
    .filter(Boolean)
    .slice(0, 2);
};

const normalizeConfidence = (value) => (CONFIDENCE_LEVELS.includes(value) ? value : "medium");

const buildRuleInsights = (record, ruleAlerts, trendContext) => {
  const summary = buildDailySummaryText(record);

  const highlights = [];
  if (ruleAlerts.length > 0) {
    highlights.push({
      title: "优先关注异常信号",
      reason: ruleAlerts[0],
      confidence: "high",
    });
  } else if (trendContext.riskDays > 0) {
    highlights.push({
      title: "近期有轻微波动",
      reason: `最近${trendContext.daysCovered}天中有${trendContext.riskDays}天出现需关注信号。`,
      confidence: "medium",
    });
  }

  const actions = [];
  if (record.hydration && record.hydration.status === "偏少") {
    actions.push("今晚可增加一次湿粮或分次引导饮水，明早复查饮水状态。");
  }
  if (record.medical && ["观察中", "需复诊"].includes(normalizeText(record.medical.status, ""))) {
    actions.push("保留症状变化记录，若持续或加重请按计划复诊。");
  }
  if (actions.length === 0) {
    actions.push("保持当前节奏，明日继续完整记录饮食、饮水、排泄和活动。", "若出现突发精神萎靡或食欲下降，优先记录并及时复评。");
  }

  const positives = [];
  if (record.sleep && normalizeText(record.sleep.quality, "") === "深睡") positives.push("睡眠质量表现稳定。");
  if (record.mood && normalizeText(record.mood.mood, "") === "开心") positives.push("情绪状态积极。");

  return {
    summary,
    highlights: highlights.slice(0, 2),
    actions: actions.slice(0, 3),
    positives: positives.slice(0, 2),
    alerts: ruleAlerts,
    overallConfidence: "medium",
  };
};

const parseAiResult = (content, fallbackInsights) => {
  const parsed = safeParseJsonFromText(content);
  if (!parsed) {
    throw new Error("doubao output invalid");
  }

  const summary = normalizeText(parsed.summary, "").trim() || fallbackInsights.summary;
  const alerts = sanitizeAlerts(parsed.alerts);
  const highlights = sanitizeHighlights(parsed.highlights);
  const actions = sanitizeStringList(parsed.actions, 3);
  const positives = sanitizeStringList(parsed.positives, 3);

  return {
    summary,
    alerts,
    alertLevel: parsed.alertLevel === "warning" || alerts.length > 0 ? "warning" : "normal",
    highlights,
    actions,
    positives,
    overallConfidence: normalizeConfidence(parsed.overallConfidence),
  };
};

const generateAiSummaryByDoubao = async (record, trendContext, petProfile, fallbackInsights) => {
  if (!DOUBAO_API_KEY || !DOUBAO_MODEL) {
    throw new Error("doubao env missing: DOUBAO_API_KEY / DOUBAO_MODEL");
  }

  const promptData = buildAiInputFromRecord(record);
  const aiContext = {
    petProfile,
    todayRecord: promptData,
    trend: trendContext,
  };

  console.log("[AI] insight context:", JSON.stringify(aiContext, null, 2));

  const detailedPrompt = `你是宠物健康管理助手，需要输出“有优先级、可执行”的建议，不要平均复述字段。

【输入数据】\n${JSON.stringify(aiContext, null, 2)}

【输出目标】
1. 先给一句结论（summary），突出今天最关键变化。
2. highlights 最多2条，每条包含 title/reason/confidence(high|medium|low)，按风险优先级排序。
3. actions 给出1-3条可执行动作，要求有时间或操作细节。
4. positives 提炼1-2条积极表现，避免全是风险。
5. alerts 只放真正需要关注的问题，不要泛泛提醒。
6. 允许不覆盖所有字段，重点优先；但不能捏造。

【输出格式】仅输出合法 JSON：
{
  "summary": "40-90字结论",
  "highlights": [{"title":"...","reason":"...","confidence":"high"}],
  "actions": ["..."],
  "positives": ["..."],
  "alerts": ["..."],
  "alertLevel": "normal or warning",
  "overallConfidence": "high or medium or low"
}`;

  const payload = {
    model: DOUBAO_MODEL,
    temperature: 0.25,
    max_tokens: 700,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          "你负责生成宠物健康洞察。输出必须是合法 JSON；优先给风险排序、趋势判断、可执行建议。",
      },
      {
        role: "user",
        content: detailedPrompt,
      },
    ],
  };

  const apiData = await callDoubaoApi(payload);
  const content =
    apiData &&
    apiData.choices &&
    apiData.choices[0] &&
    apiData.choices[0].message &&
    apiData.choices[0].message.content
      ? apiData.choices[0].message.content
      : "";

  return parseAiResult(content, fallbackInsights);
};

const buildRuleAlerts = (day1, day2) => {
  const alerts = [];

  const hydrationLowTwoDays = Boolean(
    day1 &&
      day2 &&
      day1.hydration &&
      day2.hydration &&
      day1.hydration.status === "偏少" &&
      day2.hydration.status === "偏少"
  );

  const poopAbnormalTwoDays = Boolean(
    day1 &&
      day2 &&
      day1.excretion &&
      day2.excretion &&
      day1.excretion.poopStatus &&
      day2.excretion.poopStatus &&
      day1.excretion.poopStatus !== "正常" &&
      day2.excretion.poopStatus !== "正常"
  );

  if (hydrationLowTwoDays) {
    alerts.push("连续2天饮水偏少，建议关注补水情况。");
  }

  if (poopAbnormalTwoDays) {
    alerts.push("连续2天排便异常，建议重点观察，必要时及时就医。");
  }

  return alerts;
};

const generateDailyInsights = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, date } = event.data;

    const currentResult = await db
      .collection("pets_daily_records")
      .where({ pet_id, date, owner_openid: wxContext.OPENID })
      .get();

    const currentRecord = currentResult.data[0];
    if (!currentRecord) {
      const emptyInsights = {
        summary: DEFAULT_SUMMARY,
        highlights: [],
        actions: [],
        positives: [],
        alerts: [],
        overallConfidence: "low",
      };
      return {
        success: true,
        data: {
          summary: DEFAULT_SUMMARY,
          alerts: [],
          alertLevel: "normal",
          source: "rule",
          alertSource: "rule",
          insights: emptyInsights,
        },
      };
    }

    const currentDate = new Date(`${date}T00:00:00`);
    const prevDate = formatDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    const trendStartDate = formatDate(new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000));

    const twoDaysResult = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
        date: db.command.gte(prevDate).and(db.command.lte(date)),
      })
      .orderBy("date", "asc")
      .get();

    const recentDaysResult = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
        date: db.command.gte(trendStartDate).and(db.command.lte(date)),
      })
      .orderBy("date", "asc")
      .get();

    const petResult = await db
      .collection("pets")
      .where({
        _id: pet_id,
        owner_openid: wxContext.OPENID,
      })
      .get();

    const petProfile = buildPetProfile(petResult.data[0]);
    const trendContext = buildTrendContext(recentDaysResult.data || [], date);

    const byDate = {};
    twoDaysResult.data.forEach((item) => {
      byDate[item.date] = item;
    });

    const ruleAlerts = buildRuleAlerts(byDate[prevDate], byDate[date]);
    const fallbackInsights = buildRuleInsights(currentRecord, ruleAlerts, trendContext);

    let summary = fallbackInsights.summary;
    let summarySource = "rule";
    let aiSucceeded = false;
    let aiErrorMsg = "";
    let aiResult = {
      ...fallbackInsights,
      alertLevel: ruleAlerts.length > 0 ? "warning" : "normal",
    };

    try {
      aiResult = await generateAiSummaryByDoubao(currentRecord, trendContext, petProfile, fallbackInsights);
      summary = aiResult.summary || summary;
      summarySource = "ai";
      aiSucceeded = true;
    } catch (aiErr) {
      aiErrorMsg = aiErr && aiErr.message ? aiErr.message : String(aiErr || "");
      console.warn(
        "[AI] generateAiSummaryByDoubao fallback to rule:",
        aiErrorMsg
      );
    }

    const alerts = mergeUniqueAlerts(ruleAlerts, aiResult.alerts || []);
    const alertLevel = alerts.length > 0 || aiResult.alertLevel === "warning" ? "warning" : "normal";
    const alertSource = aiSucceeded ? (ruleAlerts.length > 0 ? "ai+rule" : "ai") : "rule";

    const insights = {
      summary,
      highlights: aiResult.highlights || fallbackInsights.highlights || [],
      actions: aiResult.actions || fallbackInsights.actions || [],
      positives: aiResult.positives || fallbackInsights.positives || [],
      alerts,
      overallConfidence: aiResult.overallConfidence || "medium",
      trend: trendContext,
    };

    await db.collection("pets_daily_records").doc(currentRecord._id).update({
      data: {
        ai_summary: summary,
        ai_summary_source: summarySource,
        ai_summary_updated_at: new Date(),
        ai_insights: insights,
        ai_error: aiErrorMsg || "",
        alerts,
        alert_level: alertLevel,
        alert_source: alertSource,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      data: {
        summary,
        alerts,
        alertLevel,
        source: summarySource,
        alertSource,
        insights,
        aiDebug: {
          succeeded: aiSucceeded,
          error: aiErrorMsg || "",
          hasApiKey: !!DOUBAO_API_KEY,
          hasModel: !!DOUBAO_MODEL,
          timeoutMs: 20000,
        },
      },
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

module.exports = {
  buildDailySummaryText,
  buildRuleAlerts,
  buildAiInputFromRecord,
  generateDailyInsights,
};
