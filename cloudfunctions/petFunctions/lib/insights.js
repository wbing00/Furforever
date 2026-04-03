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

const callDoubaoApi = (payload, timeoutMs = 12000) =>
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
});

const parseAiResult = (content) => {
  const parsed = safeParseJsonFromText(content);
  if (!parsed || typeof parsed.summary !== "string") {
    throw new Error("doubao output invalid");
  }

  const summary = parsed.summary.trim();
  if (!summary) {
    throw new Error("doubao summary empty");
  }

  const alerts = sanitizeAlerts(parsed.alerts);
  const alertLevel = parsed.alertLevel === "warning" || alerts.length > 0 ? "warning" : "normal";

  return { summary, alerts, alertLevel };
};

const generateAiSummaryByDoubao = async (record) => {
  if (!DOUBAO_API_KEY || !DOUBAO_MODEL) {
    throw new Error("doubao env missing: DOUBAO_API_KEY / DOUBAO_MODEL");
  }

  const promptData = buildAiInputFromRecord(record);
  console.log("[AI] prompt data:", JSON.stringify(promptData, null, 2));

  const detailedPrompt = `你是一个专业、克制、温和的宠物健康记录助手。请根据以下宠物当日记录生成健康摘要。
【记录数据】${JSON.stringify(promptData, null, 2)}

【任务要求】1. 优先覆盖所有已记录项目，包括饮食、饮水、排泄、活动、睡眠、情绪。2. 即使某项存在异常，也不要只盯着异常，要给出完整概括。3. 只描述已记录内容，不要反复提“未记录”。4. 摘要语气自然，像宠物主人的健康日报，不要夸张。5. 如果存在需要关注的问题，再放入 alerts 数组；没有异常则返回空数组。
【输出格式】请只输出 JSON，不要附加解释：
{
  "summary": "80-150字的自然中文摘要",
  "alerts": ["需要关注的异常提醒"],
  "alertLevel": "normal or warning"
}`;

  const payload = {
    model: DOUBAO_MODEL,
    temperature: 0.3,
    max_tokens: 500,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          "你负责生成宠物健康摘要。输出必须是合法 JSON，内容要完整覆盖记录项，避免遗漏，避免只强调单一异常。",
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

  return parseAiResult(content);
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
      return {
        success: true,
        data: {
          summary: DEFAULT_SUMMARY,
          alerts: [],
          alertLevel: "normal",
          source: "rule",
          alertSource: "rule",
        },
      };
    }

    let summary = buildDailySummaryText(currentRecord);
    let summarySource = "rule";
    let aiAlerts = [];
    let aiAlertLevel = "normal";
    let aiSucceeded = false;

    const currentDate = new Date(`${date}T00:00:00`);
    const prevDate = formatDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));

    const twoDaysResult = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
        date: db.command.gte(prevDate).and(db.command.lte(date)),
      })
      .orderBy("date", "asc")
      .get();

    const byDate = {};
    twoDaysResult.data.forEach((item) => {
      byDate[item.date] = item;
    });

    const ruleAlerts = buildRuleAlerts(byDate[prevDate], byDate[date]);

    try {
      const aiResult = await generateAiSummaryByDoubao(currentRecord);
      summary = aiResult.summary || summary;
      aiAlerts = aiResult.alerts || [];
      aiAlertLevel = aiResult.alertLevel || "normal";
      summarySource = "ai";
      aiSucceeded = true;
    } catch (aiErr) {
      console.warn(
        "[AI] generateAiSummaryByDoubao fallback to rule:",
        aiErr && aiErr.message ? aiErr.message : aiErr
      );
    }

    const alerts = mergeUniqueAlerts(ruleAlerts, aiAlerts);
    const alertLevel = alerts.length > 0 || aiAlertLevel === "warning" ? "warning" : "normal";
    const alertSource = aiSucceeded ? (ruleAlerts.length > 0 ? "ai+rule" : "ai") : "rule";

    await db.collection("pets_daily_records").doc(currentRecord._id).update({
      data: {
        ai_summary: summary,
        ai_summary_source: summarySource,
        ai_summary_updated_at: new Date(),
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
